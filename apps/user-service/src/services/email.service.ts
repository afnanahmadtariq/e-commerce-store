import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

class EmailService {
    private transporter: Transporter | null = null;
    private fromEmail: string;
    private fromName: string;
    private isConfigured = false;

    constructor() {
        this.fromEmail = process.env['EMAIL_FROM'] || 'noreply@ecommerce.com';
        this.fromName = process.env['EMAIL_FROM_NAME'] || 'E-Commerce Store';
        this.initialize();
    }

    private initialize(): void {
        const host = process.env['SMTP_HOST'];
        const port = parseInt(process.env['SMTP_PORT'] || '587', 10);
        const user = process.env['SMTP_USER'];
        const pass = process.env['SMTP_PASS'];

        if (!host || !user || !pass) {
            console.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables.');
            return;
        }

        const config: EmailConfig = {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        };

        this.transporter = nodemailer.createTransport(config);
        this.isConfigured = true;

        // Verify connection
        this.transporter.verify((error) => {
            if (error) {
                console.error('Email service connection failed:', error.message);
                this.isConfigured = false;
            } else {
                console.log('Email service connected and ready');
            }
        });
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured || !this.transporter) {
            console.warn('Email service not configured, skipping email:', options.subject);
            return false;
        }

        try {
            await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || this.stripHtml(options.html),
            });
            console.log(`Email sent to ${options.to}: ${options.subject}`);
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }

    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Email Templates
    async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
        const verifyUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:4200'}/auth/verify-email?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Welcome to E-Commerce Store!</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for signing up! Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link will expire in 24 hours.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link:<br>
              <a href="${verifyUrl}" style="color: #667eea;">${verifyUrl}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to,
            subject: 'Verify Your Email Address - E-Commerce Store',
            html,
        });
    }

    async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
        const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:4200'}/auth/reset-password?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to,
            subject: 'Reset Your Password - E-Commerce Store',
            html,
        });
    }

    async sendOrderConfirmationEmail(
        to: string,
        name: string,
        orderNumber: string,
        total: number,
        items: Array<{ name: string; quantity: number; price: number }>
    ): Promise<boolean> {
        const orderUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:4200'}/orders/${orderNumber}`;

        const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Order Confirmed! 🎉</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 10px; color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for your order! We've received your order and will begin processing it shortly.
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
              <p style="margin: 5px 0 0; color: #111827; font-size: 20px; font-weight: 700;">${orderNumber}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: 700; color: #111827;">Total:</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: 700; color: #10b981; font-size: 18px;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to,
            subject: `Order Confirmed - ${orderNumber} - E-Commerce Store`,
            html,
        });
    }

    async sendOrderStatusUpdateEmail(
        to: string,
        name: string,
        orderNumber: string,
        status: string,
        trackingNumber?: string
    ): Promise<boolean> {
        const orderUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:4200'}/orders/${orderNumber}`;

        const statusColors: Record<string, string> = {
            confirmed: '#10b981',
            processing: '#f59e0b',
            shipped: '#3b82f6',
            out_for_delivery: '#8b5cf6',
            delivered: '#10b981',
            cancelled: '#ef4444',
        };

        const statusMessages: Record<string, string> = {
            confirmed: 'Your order has been confirmed and is being prepared.',
            processing: 'Your order is being processed and will be shipped soon.',
            shipped: `Your order has been shipped!${trackingNumber ? ` Tracking number: ${trackingNumber}` : ''}`,
            out_for_delivery: 'Your order is out for delivery and will arrive soon!',
            delivered: 'Your order has been delivered. Enjoy your purchase!',
            cancelled: 'Your order has been cancelled.',
        };

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: ${statusColors[status] || '#667eea'}; padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Order ${status.replace('_', ' ').toUpperCase()}</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
              ${statusMessages[status] || `Your order status has been updated to: ${status}`}
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
              <p style="margin: 5px 0 0; color: #111827; font-size: 20px; font-weight: 700;">${orderNumber}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="display: inline-block; background: ${statusColors[status] || '#667eea'}; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                View Order Details
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

        return this.sendEmail({
            to,
            subject: `Order ${status.replace('_', ' ')} - ${orderNumber} - E-Commerce Store`,
            html,
        });
    }
}

// Export singleton instance
export const emailService = new EmailService();
