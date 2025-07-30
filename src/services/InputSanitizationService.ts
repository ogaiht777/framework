import { DIContainer } from './DIContainer';

/**
 * A service for sanitizing various types of input to prevent vulnerabilities.
 */
export class InputSanitizationService {
    constructor() {
        // Register this service in the DI container if needed elsewhere
        // DIContainer.instance.register(InputSanitizationService, this);
    }

    /**
     * Sanitizes a string by escaping HTML entities to prevent XSS attacks.
     * @param input The string to sanitize.
     * @returns The sanitized string.
     */
    public sanitizeHtml(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Sanitizes a string by removing potentially dangerous characters for SQL queries.
     * This is a basic example and should be used in conjunction with parameterized queries.
     * @param input The string to sanitize.
     * @returns The sanitized string.
     */
    public sanitizeSql(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }
        // Basic sanitization: remove common SQL injection characters
        return input.replace(/['"`;%*]/g, '');
    }

    /**
     * Sanitizes a number, ensuring it's an integer and optionally within a range.
     * @param input The number to sanitize.
     * @param min Optional minimum value.
     * @param max Optional maximum value.
     * @returns The sanitized integer, or NaN if invalid.
     */
    public sanitizeInt(input: any, min?: number, max?: number): number {
        const num = parseInt(input, 10);
        if (isNaN(num)) {
            return NaN;
        }
        if (min !== undefined && num < min) {
            return min;
        }
        if (max !== undefined && num > max) {
            return max;
        }
        return num;
    }

    /**
     * Sanitizes a number, ensuring it's a float and optionally within a range.
     * @param input The number to sanitize.
     * @param min Optional minimum value.
     * @param max Optional maximum value.
     * @returns The sanitized float, or NaN if invalid.
     */
    public sanitizeFloat(input: any, min?: number, max?: number): number {
        const num = parseFloat(input);
        if (isNaN(num)) {
            return NaN;
        }
        if (min !== undefined && num < min) {
            return min;
        }
        if (max !== undefined && num > max) {
            return max;
        }
        return num;
    }

    /**
     * Removes non-alphanumeric characters from a string, useful for usernames or IDs.
     * @param input The string to sanitize.
     * @returns The sanitized string.
     */
    public sanitizeAlphanumeric(input: string): string {
        if (typeof input !== 'string') {
            return '';
        }
        return input.replace(/[^a-zA-Z0-9]/g, '');
    }
}
