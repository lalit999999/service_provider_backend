# Email Configuration Guide

This project uses Nodemailer for sending emails. Follow the steps below to set up email functionality.

## Supported Email Services

### 1. Gmail (Recommended for Development)

**Setup Steps:**

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "App passwords" (appears only if 2FA is enabled)
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password

3. Update `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@localserviceprovider.com
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. SendGrid (Recommended for Production)

**Setup Steps:**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API Key from the dashboard
3. Verify your sender email address
4. Update `.env` file:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@localserviceprovider.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. Custom SMTP Server

If you want to use your own SMTP server:

```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@localserviceprovider.com
FRONTEND_URL=http://localhost:5173
```

## Environment Variables Required

- `EMAIL_SERVICE` - Service type: `gmail`, `sendgrid`, or `custom`
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASSWORD` - Email password or app-specific password
- `EMAIL_FROM` - Email address shown as sender
- `FRONTEND_URL` - Your frontend URL for password reset links
- `NODE_ENV` - Environment: `development` or `production`

## Features

### Password Reset Email

- Sends reset code (4-digit number)
- Includes clickable reset link
- Email expires in 15 minutes
- Professional HTML template

### Welcome Email

- Sent automatically on user registration
- Personalized greeting
- Confirmation of account creation

## Testing

In **development mode**, the `forgotPassword` endpoint returns the reset token in the response for testing:

```json
{
  "message": "If an account with this email exists, you will receive a password reset link",
  "resetToken": "1234"
}
```

In **production mode**, the token is NOT returned for security.

## Email Templates

Both email templates include:

- Professional HTML formatting
- Branding and logo area
- Clear call-to-action buttons
- Footer with company info
- Mobile-responsive design

## Troubleshooting

### Gmail Connection Issues

- Ensure 2FA is enabled
- Use an app-specific password (not your regular password)
- Enable "Less secure apps" if you're not using an app password

### SendGrid Issues

- Verify your sender email is confirmed
- Check API key has Mail Send permission
- Ensure recipient email is valid

### General Issues

- Check email service credentials in `.env`
- Review console logs for error messages
- Test with a development service first (Gmail)

## Email Configuration in Production

For production, use SendGrid or a professional email service:

- Better deliverability
- Higher sending limits
- Built-in bounce/complaint handling
- Email tracking and analytics

## Security Notes

- Never commit `.env` files with real credentials
- Use application-specific passwords, not primary account passwords
- Enable email verification in production
- Consider rate limiting password reset requests
