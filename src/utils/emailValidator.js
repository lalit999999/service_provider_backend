// utils/emailValidator.js
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Checks if an email address format is valid using regex.
 * Returns true if valid, false otherwise.
 */
function isValidEmailFormat(email) {
    // RFC 5322 Official Standard regex (simplified)
    const emailRegex = /^[\w.-]+@[\w-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Checks if the email domain actually exists by checking MX records.
 * Returns true if domain has mail servers, false otherwise.
 */
async function doesEmailDomainExist(email) {
    try {
        // Extract domain from email
        const domain = email.split('@')[1];

        // Check if domain has MX records (mail servers)
        const mxRecords = await resolveMx(domain);

        // If MX records exist, the domain is valid
        return mxRecords && mxRecords.length > 0;
    } catch (err) {
        // Domain doesn't exist or error checking MX records
        return false;
    }
}

/**
 * Validates email format and checks if domain exists.
 * Returns { valid: boolean, error: string | null }
 */
export async function isValidEmail(email) {
    // Check format first
    if (!isValidEmailFormat(email)) {
        return {
            valid: false,
            error: 'Invalid email format',
        };
    }

    // Then check if domain exists
    const domainExists = await doesEmailDomainExist(email);
    if (!domainExists) {
        return {
            valid: false,
            error: 'Email domain does not exist',
        };
    }

    return {
        valid: true,
        error: null,
    };
}
