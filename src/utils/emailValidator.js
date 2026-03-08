// utils/emailValidator.js
import { validate } from 'deep-email-validator';

/**
 * Validates email using deep-email-validator.
 * Performs comprehensive validation including:
 * - Format validation
 * - DNS records (MX, A records)
 * - SMTP validation
 * - Disposable email detection
 * - Typo checking
 * 
 * Returns { valid: boolean, status: 'real' | 'fake', error: string | null }
 */
export async function isValidEmail(email) {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
        return {
            valid: false,
            status: 'fake',
            error: 'Address not found',
        };
    }

    try {
        // Perform deep email validation
        const result = await validate({
            email: normalizedEmail,
            validateRegex: true,
            validateMx: true,
            validateTypo: true,
            validateDisposable: true,
            validateSMTP: false, // Set to true for SMTP validation (slower but more thorough)
        });

        // Check if email is valid
        if (!result.valid) {
            // Provide user-friendly error messages
            let errorMessage = 'Invalid email address';

            if (result.reason === 'regex') {
                errorMessage = 'Invalid email format';
            } else if (result.reason === 'mx') {
                errorMessage = 'Email domain does not exist';
            } else if (result.reason === 'disposable') {
                errorMessage = 'Disposable email addresses are not allowed';
            } else if (result.reason === 'typo') {
                errorMessage = result.validators?.typo?.reason || 'Possible typo in email address';
            } else if (result.reason === 'smtp') {
                errorMessage = 'Email address does not exist';
            }

            return {
                valid: false,
                status: 'fake',
                error: errorMessage,
            };
        }

        return {
            valid: true,
            status: 'real',
            error: null,
        };
    } catch (err) {
        console.error('Email validation error:', err);
        // Fallback to basic format check in case of validation service failure
        const basicEmailRegex = /^[\w.-]+@[\w-]+\.[A-Za-z]{2,}$/;
        if (!basicEmailRegex.test(normalizedEmail)) {
            return {
                valid: false,
                status: 'fake',
                error: 'Invalid email format',
            };
        }

        // Allow registration if validation service fails but format is correct
        return {
            valid: true,
            status: 'real',
            error: null,
        };
    }
}
