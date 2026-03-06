import nodemailer from 'nodemailer';

// Create transporter based on environment
const createTransporter = () => {
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    } else {
        // Fallback to development transporter (Ethereal test account)
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
};

const transporter = createTransporter();

export const sendResetPasswordEmail = async (email, resetToken, userName) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Local Service Provider',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center;">
                        <h1 style="color: #2d3748; margin: 0;">Local Service Provider</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="color: #2d3748; font-size: 16px;">Hello ${userName},</p>
                        
                        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                            We received a request to reset your password. If you didn't make this request, you can ignore this email.
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${resetLink}" style="background-color: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #4a5568; font-size: 14px; margin-top: 30px;">
                            <strong>Or use this reset code:</strong>
                        </p>
                        
                        <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                            <p style="font-size: 24px; font-weight: bold; color: #2d3748; margin: 0; letter-spacing: 2px;">
                                ${resetToken}
                            </p>
                        </div>
                        
                        <p style="color: #718096; font-size: 13px;">
                            <strong>Note:</strong> This reset code will expire in 15 minutes.
                        </p>
                        
                        <p style="color: #718096; font-size: 13px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                    
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Local Service Provider. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Local Service Provider',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center;">
                        <h1 style="color: #2d3748; margin: 0;">Welcome to Local Service Provider</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="color: #2d3748; font-size: 16px;">Hello ${userName},</p>
                        
                        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                            Thank you for registering with Local Service Provider. Your account has been created successfully!
                        </p>
                        
                        <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                            You can now log in to your account and start exploring services in your area.
                        </p>
                        
                        <p style="color: #718096; font-size: 13px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                    
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Local Service Provider. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};
