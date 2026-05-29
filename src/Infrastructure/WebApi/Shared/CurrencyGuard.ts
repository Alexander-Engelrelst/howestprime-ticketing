import { Guard, IllegalArgumentException } from '@domaincrafters/std';

// TODO(alexander): this is problematic in it's entirety

// we avoid inheriting from the base guard class as it involves chaining methods
/**
 * @description A custom guard for validating that a provided numeric value is a valid monetary amount in euros. 
 * It keeps floating point errors in mind
 * @function isValidCurrencyInEuro(value: unknown, parameterName?: string) - Validates that the value is a number representing a valid monetary amount in euros, allowing at most 2 decimal places (e.g., 15.00, 0.99, but not 12.345).
*/
export class CurrencyGuard {
    private static readonly EPS = 1e-9;

    /**
     * @description Validates that a provided value is a number representing a valid monetary amount in euros, 
     * allowing at most 2 decimal places. It safely accounts for native floating-point arithmetic errors.
     * * @param value - The unknown input value to validate.
     * @param parameterName - The name of the variable, used to format descriptive error messages. Defaults to 'value'.
     * @returns The internal framework Guard instance for further constraint chaining if needed.
     * @throws {IllegalArgumentException} If the value is not a number, is negative, or contains microcents (> 2 decimal places).
     * * @example
     * // Standard valid usage
     * CurrencyGuard.isValidCurrencyInEuro(15.00, 'price');
     * * @example
     * // Floating-point error handling (Will safely pass)
     * // 159.45 * 100 results in 15944.999999999998 internally.
     * // The guard identifies this engine noise and allows it to pass.
     * CurrencyGuard.isValidCurrencyInEuro(159.45, 'price'); 
     * * @example
     * // Client-side floating-point noise handling (Will safely pass)
     * // If the frontend/JSON payload sends an inherently distorted float like 1.9999999999999,
     * // the guard recognizes the variance is well below the EPS threshold and lets it pass.
     * CurrencyGuard.isValidCurrencyInEuro(1.9999999999999, 'price');
     * * @example
     * // Invalid usage (Will throw an exception)
     * CurrencyGuard.isValidCurrencyInEuro(12.345, 'price'); // more than 2 decimal places
     * CurrencyGuard.isValidCurrencyInEuro(-5.00, 'price');  // negative value
     * CurrencyGuard.isValidCurrencyInEuro('15.00', 'price'); // not a number
     */
    public static isValidCurrencyInEuro(value: unknown, parameterName?: string): Guard<unknown> {
        const guard = Guard.check(value, parameterName || 'value')
            .isType('number').againstNegative();

        const numberValue = value as number;
        const cents = (numberValue * 100);
        const isValid = Math.abs(cents - Math.round(cents)) < CurrencyGuard.EPS;

        if (!isValid) {
            throw new IllegalArgumentException(
                `${parameterName || 'value'} must be a valid monetary amount in euros with at most 2 decimal places, but got: '${String(value)}'`,
            );
        }

        return guard;
    }
}