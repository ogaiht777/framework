import { DIContainer } from './DIContainer';

export type ValidationResult = { isValid: boolean; errors: string[] };

export interface ValidationRule<T> {
    (value: T): string | null; // Returns error message or null if valid
}

/**
 * A generic server-side validation service.
 * Allows defining and applying validation rules to any data.
 */
export class ValidationService {
    constructor() {
        // Register this service in the DI container if needed elsewhere
        // DIContainer.instance.register(ValidationService, this);
    }

    /**
     * Validates a given data object against a set of rules.
     * @param data The data object to validate.
     * @param rules A map where keys are data properties and values are arrays of ValidationRule functions.
     * @returns A ValidationResult indicating validity and any errors.
     */
    public validate<T extends object>(data: T, rules: { [P in keyof T]?: ValidationRule<T[P]>[] }): ValidationResult {
        const errors: string[] = [];

        for (const key in rules) {
            if (rules.hasOwnProperty(key)) {
                const propertyRules = rules[key];
                if (propertyRules) {
                    for (const rule of propertyRules) {
                        const error = rule(data[key]!);
                        if (error) {
                            errors.push(`${String(key)}: ${error}`);
                        }
                    }
                }
            }
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Creates a simple required field validation rule.
     * @param fieldName The name of the field for the error message.
     */
    public static required(fieldName: string): ValidationRule<any> {
        return (value: any) => {
            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                return `${fieldName} is required.`;
            }
            return null;
        };
    }

    /**
     * Creates a simple min length validation rule for strings.
     * @param fieldName The name of the field for the error message.
     * @param minLength The minimum allowed length.
     */
    public static minLength(fieldName: string, minLength: number): ValidationRule<string> {
        return (value: string) => {
            if (typeof value === 'string' && value.length < minLength) {
                return `${fieldName} must be at least ${minLength} characters long.`;
            }
            return null;
        };
    }

    /**
     * Creates a simple max length validation rule for strings.
     * @param fieldName The name of the field for the error message.
     * @param maxLength The maximum allowed length.
     */
    public static maxLength(fieldName: string, maxLength: number): ValidationRule<string> {
        return (value: string) => {
            if (typeof value === 'string' && value.length > maxLength) {
                return `${fieldName} cannot exceed ${maxLength} characters.`;
            }
            return null;
        };
    }

    /**
     * Creates a simple numeric range validation rule.
     * @param fieldName The name of the field for the error message.
     * @param min The minimum allowed value.
     * @param max The maximum allowed value.
     */
    public static range(fieldName: string, min: number, max: number): ValidationRule<number> {
        return (value: number) => {
            if (typeof value === 'number' && (value < min || value > max)) {
                return `${fieldName} must be between ${min} and ${max}.`;
            }
            return null;
        };
    }
}
