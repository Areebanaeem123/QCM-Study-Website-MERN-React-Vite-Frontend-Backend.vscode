"""
Email service for sending invoices and notifications
"""
import os
from typing import List, Dict, Any
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template

class EmailService:
    """Service for sending emails"""
    
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@qcm-study.ch")
    FROM_NAME = os.getenv("FROM_NAME", "QCM-STUDY")

    INVOICE_TEMPLATE = """
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto;">
                <tr>
                    <td style="text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff;">
                        <h1 style="color: #007bff; margin: 0;">QCM-STUDY</h1>
                        <p style="color: #666; margin: 5px 0;">Invoice</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px 0;">
                        <h2 style="color: #333; margin-top: 0;">Invoice #{{ transaction_id }}</h2>
                        <p><strong>Date:</strong> {{ date }}</p>
                        <p><strong>Customer:</strong> {{ customer_name }}</p>
                        <p><strong>Email:</strong> {{ customer_email }}</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 0;">
                        <h3 style="color: #333;">Items Purchased</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #ddd;">
                                <th style="text-align: left; padding: 10px; background-color: #f5f5f5;">Item</th>
                                <th style="text-align: right; padding: 10px; background-color: #f5f5f5;">Price</th>
                            </tr>
                            {% for item in items %}
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 10px;">
                                    <strong>{{ item.title }}</strong><br>
                                    <small style="color: #666;">{{ item.type|capitalize }}</small>
                                </td>
                                <td style="text-align: right; padding: 10px;">{{ item.price }} {{ currency }}</td>
                            </tr>
                            {% endfor %}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 0;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="text-align: right; padding: 5px;"><strong>Subtotal:</strong></td>
                                <td style="text-align: right; padding: 5px; width: 100px;">{{ original_amount }} {{ currency }}</td>
                            </tr>
                            {% if discount_amount > 0 %}
                            <tr style="color: #28a745;">
                                <td style="text-align: right; padding: 5px;"><strong>Discount:</strong></td>
                                <td style="text-align: right; padding: 5px;">-{{ discount_amount }} {{ currency }}</td>
                            </tr>
                            {% endif %}
                            <tr style="border-top: 2px solid #007bff;">
                                <td style="text-align: right; padding: 10px;"><strong style="font-size: 18px; color: #007bff;">Total:</strong></td>
                                <td style="text-align: right; padding: 10px; font-size: 18px; color: #007bff;"><strong>{{ final_amount }} {{ currency }}</strong></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 0; border-top: 2px solid #ddd; text-align: center;">
                        <p style="color: #666; font-size: 12px; margin: 5px 0;">
                            Payment Status: <strong style="color: #28a745;">{{ status|capitalize }}</strong><br>
                            Payment Method: <strong>{{ payment_method }}</strong><br>
                            Payment Date: <strong>{{ completed_at }}</strong>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 0; background-color: #f5f5f5; border-radius: 5px;">
                        <p style="color: #666; font-size: 12px; margin: 0;">
                            <strong>Access Your Content:</strong><br>
                            Your purchased items are now available in your dashboard.<br>
                            <a href="{{ dashboard_url }}" style="color: #007bff; text-decoration: none;">
                                Click here to access your dashboard
                            </a>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 0; text-align: center; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
                        <p style="margin: 5px 0;">
                            QCM-STUDY<br>
                            Payment processed securely by Stripe<br>
                            © 2026 QCM-STUDY. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
    </html>
    """

    @classmethod
    def send_invoice_email(
        cls,
        to_email: str,
        customer_name: str,
        transaction_id: str,
        items: List[Dict[str, Any]],
        original_amount: float,
        discount_amount: float,
        final_amount: float,
        payment_method: str,
        status: str,
        currency: str = "DT",
        dashboard_url: str = "https://qcm-study.ch/tableau-de-bord"
    ) -> bool:
        """
        Send invoice email to customer
        
        Args:
            to_email: Recipient email address
            customer_name: Customer name
            transaction_id: Transaction/Invoice ID
            items: List of purchased items
            original_amount: Amount before discount
            discount_amount: Discount amount
            final_amount: Final amount charged
            payment_method: Payment method used
            status: Payment status
            currency: Currency code
            dashboard_url: URL to dashboard
        
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Prepare email content
            template = Template(cls.INVOICE_TEMPLATE)
            
            html_content = template.render(
                transaction_id=transaction_id,
                date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                customer_name=customer_name,
                customer_email=to_email,
                items=items,
                original_amount=f"{original_amount:.2f}",
                discount_amount=f"{discount_amount:.2f}",
                final_amount=f"{final_amount:.2f}",
                payment_method=payment_method,
                status=status,
                currency=currency,
                completed_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                dashboard_url=dashboard_url
            )

            # Create email
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Invoice #{transaction_id} - QCM-STUDY"
            msg["From"] = f"{cls.FROM_NAME} <{cls.FROM_EMAIL}>"
            msg["To"] = to_email

            # Attach HTML content
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            if cls.SMTP_USERNAME and cls.SMTP_PASSWORD:
                with smtplib.SMTP(cls.SMTP_SERVER, cls.SMTP_PORT) as server:
                    server.starttls()
                    server.login(cls.SMTP_USERNAME, cls.SMTP_PASSWORD)
                    server.send_message(msg)
                return True
            else:
                print(f"Warning: Email not configured. Would send to {to_email}")
                return False

        except Exception as e:
            print(f"Error sending invoice email: {str(e)}")
            return False

    @classmethod
    def send_welcome_email(cls, to_email: str, customer_name: str) -> bool:
        """Send welcome email to new customer"""
        try:
            subject = "Welcome to QCM-STUDY!"
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #007bff;">Welcome to QCM-STUDY!</h1>
                    <p>Hello {customer_name},</p>
                    <p>Thank you for joining QCM-STUDY. We're excited to have you on board!</p>
                    <p>Your account is now ready. You can log in and start exploring our content.</p>
                    <a href="https://qcm-study.ch" style="color: #007bff; text-decoration: none;">
                        Visit QCM-STUDY
                    </a>
                    <p>If you have any questions, feel free to contact us.</p>
                </body>
            </html>
            """

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{cls.FROM_NAME} <{cls.FROM_EMAIL}>"
            msg["To"] = to_email

            msg.attach(MIMEText(html_content, "html"))

            if cls.SMTP_USERNAME and cls.SMTP_PASSWORD:
                with smtplib.SMTP(cls.SMTP_SERVER, cls.SMTP_PORT) as server:
                    server.starttls()
                    server.login(cls.SMTP_USERNAME, cls.SMTP_PASSWORD)
                    server.send_message(msg)
                return True
            else:
                print(f"Warning: Email not configured. Would send to {to_email}")
                return False

        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")
            return False
