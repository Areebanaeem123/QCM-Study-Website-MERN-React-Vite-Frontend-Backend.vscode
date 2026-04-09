from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import json
import stripe
from app.core.database import get_db
from app.core.stripe_service import StripeService
from app.core.email_service import EmailService
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_purchase import PackPurchase
from app.models.mock_exam import MockExam
from app.models.mock_exam_purchase import MockExamPurchase
from app.models.transaction import Transaction
from app.models.voucher import Voucher, VoucherRedemption
from app.schemas.basket import BasketCheckoutRequest, BasketCheckoutResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/create-payment-intent")
async def create_payment_intent(
    request: BasketCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a Stripe PaymentIntent for checkout
    Returns client_secret for use on frontend
    """
    if not request.accept_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms of use to proceed."
        )

    if not request.items or len(request.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The basket is empty."
        )

    try:
        # Calculate total amount
        original_amount = sum(item.price for item in request.items)
        discount_amount = 0.0
        discount_voucher = None

        # Validate and apply voucher if provided
        if request.voucher_code:
            voucher = db.query(Voucher).filter_by(
                code=request.voucher_code.upper()
            ).first()

            if not voucher or not voucher.is_valid():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired voucher code"
                )

            # Check if user already used this voucher
            redemptions = db.query(VoucherRedemption).filter_by(
                voucher_id=voucher.id,
                user_id=current_user.id
            ).count()

            if not voucher.can_be_used_by_user(current_user.id, redemptions):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already used this voucher the maximum number of times"
                )

            # Check minimum purchase
            if voucher.min_purchase_amount and original_amount < voucher.min_purchase_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Minimum purchase amount of {voucher.min_purchase_amount} required"
                )

            discount_amount = voucher.calculate_discount(original_amount)
            discount_voucher = voucher

        final_amount = original_amount - discount_amount
        amount_cents = int(final_amount * 100)  # Convert to cents

        # Create Stripe PaymentIntent
        metadata = {
            "user_id": current_user.id,
            "items_count": str(len(request.items)),
            "payment_method": request.payment_method
        }

        payment_intent = StripeService.create_payment_intent(
            amount_cents=amount_cents,
            currency="usd",  # Or use from config
            customer_email=current_user.email,
            metadata=metadata,
            payment_method_types=["card", "apple_pay", "google_pay"]
        )

        # Create transaction record (pending)
        transaction = Transaction(
            user_id=current_user.id,
            stripe_payment_intent_id=payment_intent.id,
            status="pending",
            payment_method=request.payment_method,
            original_amount=original_amount,
            discount_amount=discount_amount,
            final_amount=final_amount,
            voucher_id=discount_voucher.id if discount_voucher else None,
            items_json=json.dumps([
                {
                    "id": item.id,
                    "type": item.type,
                    "title": item.title,
                    "price": item.price
                }
                for item in request.items
            ]),
            customer_email=current_user.email,
            customer_name=current_user.full_name if hasattr(current_user, 'full_name') else current_user.email
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id,
            "transaction_id": transaction.id,
            "original_amount": original_amount,
            "discount_amount": discount_amount,
            "final_amount": final_amount,
            "status": "awaiting_payment"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create payment intent: {str(e)}"
        )


@router.post("/confirm-payment")
async def confirm_payment(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Confirm Stripe payment and process purchase
    Should be called after Stripe PaymentIntent is confirmed
    """
    try:
        payment_intent_id = data.get("payment_intent_id")
        transaction_id = data.get("transaction_id")

        if not payment_intent_id or not transaction_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing payment_intent_id or transaction_id"
            )

        # Retrieve transaction
        transaction = db.query(Transaction).filter_by(id=transaction_id).first()
        if not transaction or transaction.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )

        # Verify payment with Stripe
        payment_intent = StripeService.retrieve_payment_intent(payment_intent_id)

        if payment_intent.status != "succeeded":
            transaction.status = "failed"
            transaction.error_message = f"Payment status: {payment_intent.status}"
            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment not completed. Status: {payment_intent.status}"
            )

        # Update transaction
        transaction.status = "completed"
        transaction.completed_at = datetime.utcnow()
        
        # Robustly extract charge ID
        if hasattr(payment_intent, 'latest_charge') and payment_intent.latest_charge:
            transaction.stripe_charge_id = payment_intent.latest_charge
        elif hasattr(payment_intent, 'charges') and payment_intent.charges.data:
            transaction.stripe_charge_id = payment_intent.charges.data[0].id
        else:
            transaction.stripe_charge_id = None

        # Extract card last 4
        if payment_intent.payment_method:
            pm = payment_intent.payment_method
            if hasattr(pm, 'card') and pm.card and hasattr(pm.card, 'last4'):
                transaction.payment_method_last_four = pm.card.last4

        # Process purchases
        items = json.loads(transaction.items_json)
        purchased_item_ids = []

        for item in items:
            if item.get("type") == "pack":
                existing = db.query(PackPurchase).filter_by(
                    student_id=current_user.id,
                    pack_id=item.get("id")
                ).first()

                if not existing:
                    pack = db.query(Pack).filter_by(id=item.get("id")).first()
                    if pack:
                        purchase = PackPurchase(
                            pack_id=pack.id,
                            student_id=current_user.id
                        )
                        db.add(purchase)
                        purchased_item_ids.append(pack.id)

            elif item.get("type") == "mock_exam":
                # Check pack table first
                pack_mock = db.query(Pack).filter_by(
                    id=item.get("id"),
                    type="mock_exam"
                ).first()

                if pack_mock:
                    existing = db.query(PackPurchase).filter_by(
                        student_id=current_user.id,
                        pack_id=item.get("id")
                    ).first()

                    if not existing:
                        purchase = PackPurchase(
                            pack_id=pack_mock.id,
                            student_id=current_user.id
                        )
                        db.add(purchase)
                        purchased_item_ids.append(pack_mock.id)
                else:
                    # Check MockExam table
                    mock_exam = db.query(MockExam).filter_by(id=item.get("id")).first()

                    if mock_exam:
                        existing = db.query(MockExamPurchase).filter_by(
                            user_id=current_user.id,
                            mock_exam_id=item.get("id")
                        ).first()

                        if not existing:
                            purchase = MockExamPurchase(
                                user_id=current_user.id,
                                mock_exam_id=mock_exam.id
                            )
                            db.add(purchase)
                            purchased_item_ids.append(mock_exam.id)

        # Record voucher redemption if used
        if transaction.voucher_id:
            redemption = VoucherRedemption(
                voucher_id=transaction.voucher_id,
                user_id=current_user.id,
                transaction_id=transaction.id,
                discount_amount=transaction.discount_amount
            )
            db.add(redemption)

            # Update voucher usage count
            voucher = db.query(Voucher).filter_by(id=transaction.voucher_id).first()
            if voucher:
                voucher.current_uses += 1

        db.commit()

        # Send invoice email
        try:
            items_data = json.loads(transaction.items_json)
            EmailService.send_invoice_email(
                to_email=transaction.customer_email,
                customer_name=transaction.customer_name or current_user.email,
                transaction_id=transaction.id,
                items=items_data,
                original_amount=transaction.original_amount,
                discount_amount=transaction.discount_amount,
                final_amount=transaction.final_amount,
                payment_method=transaction.payment_method,
                status=transaction.status,
                currency=transaction.currency
            )
            transaction.invoice_sent = True
            transaction.invoice_sent_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            # Log error but don't fail the transaction
            print(f"Error sending invoice email: {str(e)}")

        return {
            "message": "Payment successful",
            "transaction_id": transaction.id,
            "status": "completed",
            "purchased_items": purchased_item_ids
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to confirm payment: {str(e)}"
        )


# Legacy checkout endpoint (for backward compatibility with simulated payments)
@router.post("/checkout", response_model=BasketCheckoutResponse)
async def checkout(
    request: BasketCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Legacy checkout endpoint - kept for backward compatibility
    For production, use create-payment-intent and confirm-payment
    """
    if not request.accept_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms of use to proceed."
        )

    if not request.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The basket is empty."
        )

    transaction_id = str(uuid.uuid4())
    purchased_item_ids = []

    for item in request.items:
        if item.type == "pack":
            existing = db.query(PackPurchase).filter_by(
                student_id=current_user.id,
                pack_id=item.id
            ).first()
            if existing:
                continue

            pack = db.query(Pack).filter_by(id=item.id).first()
            if not pack:
                continue

            purchase = PackPurchase(
                pack_id=pack.id,
                student_id=current_user.id
            )
            db.add(purchase)
            purchased_item_ids.append(pack.id)

        elif item.type == "mock_exam":
            pack_mock = db.query(Pack).filter_by(id=item.id, type="mock_exam").first()
            if pack_mock:
                existing = db.query(PackPurchase).filter_by(
                    student_id=current_user.id,
                    pack_id=item.id
                ).first()
                if not existing:
                    purchase = PackPurchase(
                        pack_id=pack_mock.id,
                        student_id=current_user.id
                    )
                    db.add(purchase)
                    purchased_item_ids.append(pack_mock.id)
                continue

            mock_exam = db.query(MockExam).filter_by(id=item.id).first()
            if mock_exam:
                existing = db.query(MockExamPurchase).filter_by(
                    user_id=current_user.id,
                    mock_exam_id=item.id
                ).first()
                if not existing:
                    purchase = MockExamPurchase(
                        user_id=current_user.id,
                        mock_exam_id=mock_exam.id
                    )
                    db.add(purchase)
                    purchased_item_ids.append(mock_exam.id)

    db.commit()

    return BasketCheckoutResponse(
        message="Purchase successful",
        transaction_id=transaction_id,
        purchased_items=purchased_item_ids,
        status="completed"
    )

