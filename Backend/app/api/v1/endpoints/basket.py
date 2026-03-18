from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_purchase import PackPurchase
from app.models.mock_exam import MockExam
from app.models.mock_exam_purchase import MockExamPurchase
from app.schemas.basket import BasketCheckoutRequest, BasketCheckoutResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/checkout", response_model=BasketCheckoutResponse)
async def checkout(
    request: BasketCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
        # Check if it's already purchased
        if item.type == "pack":
            existing = db.query(PackPurchase).filter_by(
                student_id=current_user.id,
                pack_id=item.id
            ).first()
            if existing:
                continue

            # Check if pack exists
            pack = db.query(Pack).filter_by(id=item.id).first()
            if not pack:
                continue
            
            # Create purchase
            purchase = PackPurchase(
                pack_id=pack.id,
                student_id=current_user.id
            )
            db.add(purchase)
            purchased_item_ids.append(pack.id)

        elif item.type == "mock_exam":
            # Check if it's in the packs table (as used by the frontend)
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

            # Alternatively, check in mock_exams table
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
        purchased_items=purchased_item_ids
    )
