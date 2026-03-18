"""
Stripe integration service
Handles all Stripe operations including payment intents and webhooks
"""
import os
try:
    import stripe
except ImportError:
    stripe = None  # Handle case where stripe is not installed
import json
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.transaction import Transaction
from app.models.pack_purchase import PackPurchase
from app.models.mock_exam_purchase import MockExamPurchase
from app.models.pack import Pack
from app.models.mock_exam import MockExam

# Initialize Stripe
if stripe:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

class StripeService:
    """Service for handling Stripe payments"""
    @staticmethod
    def create_payment_intent(
        amount_cents: int,
        currency: str = "usd",
        customer_email: str = None,
        metadata: Dict[str, Any] = None,
        payment_method_types: list = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe PaymentIntent for payment processing
        
        Args:
            amount_cents: Amount in cents (e.g., 5000 for $50.00)
            currency: Currency code (default: usd)
            customer_email: Customer email address
            metadata: Additional metadata to attach to the intent
            payment_method_types: List of allowed payment methods
        
        Returns:
            PaymentIntent object
        """
        if not stripe:
            raise Exception("Stripe is not configured")
            
        if payment_method_types is None:
            # Support card, Apple Pay, and Google Pay
            payment_method_types = ["card", "apple_pay", "google_pay"]
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                payment_method_types=payment_method_types,
                receipt_email=customer_email,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True}  # Enable automatic payment methods
            )
            return intent
        except stripe.error.StripeException as e:
            raise Exception(f"Stripe error: {e.user_message}")

    @staticmethod
    def confirm_payment_intent(
        payment_intent_id: str,
        payment_method_id: str = None,
        return_url: str = None
    ) -> Dict[str, Any]:
        """
        Confirm a payment intent (for card payments after client secret is confirmed)
        
        Args:
            payment_intent_id: The PaymentIntent ID
            payment_method_id: The PaymentMethod ID
            return_url: URL to return to after authentication
        
        Returns:
            Updated PaymentIntent object
        """
        if not stripe:
            raise Exception("Stripe is not configured")
            
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            confirm_kwargs = {}
            if payment_method_id:
                confirm_kwargs["payment_method"] = payment_method_id
            if return_url:
                confirm_kwargs["return_url"] = return_url
            
            intent.confirm(**confirm_kwargs)
            return intent
        except stripe.error.StripeException as e:
            raise Exception(f"Stripe error: {e.user_message}")

    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """Retrieve a PaymentIntent by ID"""
        if not stripe:
            raise Exception("Stripe is not configured")
            
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent
        except stripe.error.StripeException as e:
            raise Exception(f"Stripe error: {e.user_message}")

    @staticmethod
    def create_customer(
        email: str,
        name: str = None,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create a Stripe Customer"""
        if not stripe:
            raise Exception("Stripe is not configured")
            
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {}
            )
            return customer
        except stripe.error.StripeException as e:
            raise Exception(f"Stripe error: {e.user_message}")

    @staticmethod
    def create_payment_method(
        type_str: str,
        card_token: str = None,
        billing_details: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a PaymentMethod for various payment types
        
        Args:
            type_str: Payment method type ("card", "apple_pay", "google_pay")
            card_token: Token for card payment
            billing_details: Billing details
        
        Returns:
            PaymentMethod object
        """
        if not stripe:
            raise Exception("Stripe is not configured")
            
        try:
            if type_str == "card" and card_token:
                return stripe.PaymentMethod.create(
                    type="card",
                    card={"token": card_token},
                    billing_details=billing_details or {}
                )
            # For Apple Pay and Google Pay, the payment method is typically
            # created on the client side
            raise ValueError(f"Unsupported payment method type: {type_str}")
        except stripe.error.StripeException as e:
            raise Exception(f"Stripe error: {e.user_message}")

    @staticmethod
    def handle_purchase_success(
        db: Session,
        transaction: Transaction,
        user: User,
        items_json: str
    ) -> bool:
        """
        Handle successful payment - create purchase records
        
        Args:
            db: Database session
            transaction: Transaction object
            user: User object
            items_json: JSON string of purchased items
        
        Returns:
            True if all items were processed successfully
        """
        try:
            items = json.loads(items_json)
            
            for item in items:
                if item.get("type") == "pack":
                    existing = db.query(PackPurchase).filter_by(
                        student_id=user.id,
                        pack_id=item.get("id")
                    ).first()
                    
                    if not existing:
                        pack = db.query(Pack).filter_by(id=item.get("id")).first()
                        if pack:
                            purchase = PackPurchase(
                                pack_id=pack.id,
                                student_id=user.id
                            )
                            db.add(purchase)
                
                elif item.get("type") == "mock_exam":
                    # First check pack table
                    pack_mock = db.query(Pack).filter_by(
                        id=item.get("id"),
                        type="mock_exam"
                    ).first()
                    
                    if pack_mock:
                        existing = db.query(PackPurchase).filter_by(
                            student_id=user.id,
                            pack_id=item.get("id")
                        ).first()
                        
                        if not existing:
                            purchase = PackPurchase(
                                pack_id=pack_mock.id,
                                student_id=user.id
                            )
                            db.add(purchase)
                    else:
                        # Check MockExam table
                        mock_exam = db.query(MockExam).filter_by(
                            id=item.get("id")
                        ).first()
                        
                        if mock_exam:
                            existing = db.query(MockExamPurchase).filter_by(
                                user_id=user.id,
                                mock_exam_id=item.get("id")
                            ).first()
                            
                            if not existing:
                                purchase = MockExamPurchase(
                                    user_id=user.id,
                                    mock_exam_id=mock_exam.id
                                )
                                db.add(purchase)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to process purchase: {str(e)}")
