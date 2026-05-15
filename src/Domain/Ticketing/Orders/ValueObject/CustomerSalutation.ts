import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';


export class InvalidCustomerSalutationException extends DomainException {
    constructor(receivedValue: string) {
        // Format the received value for clarity
        const displayValue = receivedValue.trim().length === 0 
            ? "[empty or whitespace]" 
            : `"${receivedValue}"`;

        // Create a comma-separated list of valid options
        const expected = CustomerSalutation.ALLOWED_SALUTATIONS.join(", ");

        const message = `Invalid salutation: Received ${displayValue}. ` +
                        `Must be one of the following: ${expected}.`;

        super(message);
    }
}

export class CustomerSalutation extends ValueObject {
    public static readonly ALLOWED_SALUTATIONS = Object.freeze(["Mr.", "Ms.", "Mx"]);


    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CustomerSalutation {
        const normalized = value.trim();
        const instance = new CustomerSalutation(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!CustomerSalutation.ALLOWED_SALUTATIONS.includes(this._value)) {
            throw new InvalidCustomerSalutationException(this._value);
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerSalutation && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}