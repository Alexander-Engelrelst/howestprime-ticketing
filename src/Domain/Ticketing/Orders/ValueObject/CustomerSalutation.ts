import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerSalutationException extends DomainException {
    constructor() {
        super(
            `CustomerSalutation has invalid value. Allowed values are: ${
                CustomerSalutation.ALLOWED_SALUTATIONS.join(', ')
            }`,
        );
    }
}

export class CustomerSalutation extends ValueObject {
    public static readonly ALLOWED_SALUTATIONS = Object.freeze(['Mr.', 'Ms.', 'Mx']);

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
            throw new InvalidCustomerSalutationException();
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerSalutation && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
