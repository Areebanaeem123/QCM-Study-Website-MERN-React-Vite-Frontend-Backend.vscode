# Stripe Setup & Configuration Guide

## 🔑 1. Get Stripe API Keys

### Step 1: Create Stripe Account
- Go to [stripe.com](https://stripe.com)
- Sign up for a free account
- Email verification

### Step 2: Get Test Keys
1. Log in to Stripe Dashboard
2. Go to **Developers → API keys**
3. Make sure you're in **Test mode** (toggle at top right)
4. Copy both keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

⚠️ **Never commit secret keys to git!**

---

## 🛠️ 2. Setup Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Location**: `Frontend/.env.local`

### Backend (.env)
```
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# SMTP Configuration (for email invoices)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=noreply@qcm-study.ch
FROM_NAME=QCM-STUDY

# Database
DATABASE_URL=postgresql://user:password@localhost/qcm_db
```

**Location**: `Backend/.env`

---

## 📦 3. Install Dependencies

### Backend
```bash
cd Backend
pip install -r requirements.txt
```

### Frontend
```bash
cd Frontend
pnpm install
```

---

## 🗄️ 4. Setup Database

### Run Migrations
```bash
cd Backend

# Create migration files for new models
alembic revision --autogenerate -m "Add payment models"

# Apply migrations
alembic upgrade head
```

This creates the following tables:
- `vouchers` - Discount codes
- `voucher_redemptions` - Track voucher usage
- `transactions` - Payment records

---

## 🚀 5. Start the Applications

### Terminal 1 - Backend
```bash
cd Backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend
```bash
cd Frontend
pnpm dev
```

---

## 🧪 6. Test the Integration

### Test URL
```
http://localhost:3000/panier
```

### Test Flow
1. Add items to basket
2. Click "Panier" → "Procéder au paiement"
3. Follow checkout steps:
   - Review order
   - Apply test voucher (if available)
   - Accept terms
   - Enter Stripe test card details

### Stripe Test Cards
```
✅ Successful Payment:
   Card: 4242 4242 4242 4242
   Exp: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)

❌ Failed Payment:
   Card: 4000 0000 0000 0002
   Exp: Any future date
   CVC: Any 3 digits

⚠️ Authentication Required:
   Card: 4000 0025 0000 3155
   Exp: Any future date
   CVC: Any 3 digits
```

---

## 🔐 7. Backend Webhook Setup (Important!)

Webhooks allow Stripe to notify your backend of payment events.

### Create Webhook Endpoint
1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/v1/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

### Backend Webhook Handler
Create `Backend/app/api/v1/endpoints/webhooks.py`:

```python
from fastapi import APIRouter, Request, HTTPException
import stripe
import json

router = APIRouter()

@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    # Get the signature from headers
    sig_header = request.headers.get("stripe-signature")
    
    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            await request.body(),
            sig_header,
            os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # Update transaction status to completed
        
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        # Update transaction status to failed
    
    return {"status": "success"}
```

---

## 📧 8. Email Configuration (Optional but Recommended)

### Gmail Setup
1. Create Google Account or use existing
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to myaccount.google.com
   - Security → App passwords
   - Select "Mail" and "Windows Computer"
   - Copy generated password

### Update .env
```
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=generated-app-password-from-google
```

### Test Email Locally
```python
from app.core.email_service import EmailService

EmailService.send_invoice_email(
    to_email="test@example.com",
    customer_name="Test User",
    transaction_id="txn_123",
    items=[{"title": "Pack 1", "type": "pack", "price": 50}],
    original_amount=50,
    discount_amount=0,
    final_amount=50,
    payment_method="card",
    status="completed"
)
```

---

## ✅ Checklist

- [ ] Stripe account created
- [ ] API keys copied to `.env` files
- [ ] Dependencies installed (`pip install`, `pnpm install`)
- [ ] Database migrations run
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] `.env` files added to `.gitignore`
- [ ] Stripe test keys working
- [ ] Webhook endpoint configured (for production)
- [ ] Email SMTP configured (optional)

---

## 🔗 API Endpoints Summary

### Create Payment Intent
```
POST /api/v1/basket/create-payment-intent
Body: {
  "items": [...],
  "payment_method": "card",
  "accept_terms": true,
  "voucher_code": "OPTIONAL"
}
Response: {
  "client_secret": "...",
  "payment_intent_id": "pi_...",
  "transaction_id": "..."
}
```

### Confirm Payment
```
POST /api/v1/basket/confirm-payment
Body: {
  "payment_intent_id": "pi_...",
  "transaction_id": "..."
}
Response: {
  "status": "completed",
  "purchased_items": [...]
}
```

### Validate Voucher
```
POST /api/v1/vouchers/validate
Body: {
  "code": "SAVE10",
  "total_amount": 100,
  "items": [...]
}
Response: {
  "valid": true,
  "discount_amount": 10,
  "final_amount": 90
}
```

---

## 🐛 Troubleshooting

### "Stripe not found" error
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Make sure it starts with `pk_test_`
- Restart frontend dev server

### "Payment intent failed" error
- Verify `STRIPE_SECRET_KEY` in backend `.env`
- Check Stripe Dashboard for error details
- Ensure test mode is enabled

### Webhook not working
- Verify webhook URL is publicly accessible
- Check webhook signing secret in `.env`
- Review Stripe Dashboard → Developers → Webhooks for logs

### Email not sending
- Verify SMTP credentials
- Check Gmail app-specific password (not regular password)
- Test with console print statements first

---

## 📚 Useful Links

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements React](https://stripe.com/docs/js/element)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

## 🎯 Next Steps After Setup

1. **Test in Stripe Dashboard**
   - Monitor all payments in real-time
   - View payment details and metadata

2. **Enable Production Mode** (when ready)
   - Switch to live API keys
   - Test with real card transactions
   - Set up proper SSL/HTTPS

3. **Add Advanced Features**
   - Refund processing
   - Recurring/subscription billing
   - Fraud detection
   - Advanced analytics

---

**Need help?** Check the Stripe Dashboard logs or contact Stripe support.
