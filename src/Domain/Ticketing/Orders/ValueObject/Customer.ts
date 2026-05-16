import {
    CustomerEmail,
    CustomerFirstName,
    CustomerLastName,
    CustomerSalutation,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { ValueObject } from '@/Domain/Shared/ValueObject.ts';

export class Customer extends ValueObject {
    private readonly _firstName: CustomerFirstName;
    private readonly _lastName: CustomerLastName;
    private readonly _email: CustomerEmail;
    private readonly _salutation: CustomerSalutation;

    private constructor(
        firstName: CustomerFirstName,
        lastName: CustomerLastName,
        email: CustomerEmail,
        salutation: CustomerSalutation,
    ) {
        super();
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
        this._salutation = salutation;
    }

    static create(
        firstName: CustomerFirstName,
        lastName: CustomerLastName,
        email: CustomerEmail,
        salutation: CustomerSalutation,
    ): Customer {
        return new Customer(firstName, lastName, email, salutation);
    }

    override equals(other: ValueObject): boolean {
        return (
            other instanceof Customer &&
            other._firstName.equals(this._firstName) &&
            other._lastName.equals(this._lastName) &&
            other._email.equals(this._email) &&
            other._salutation.equals(this._salutation)
        );
    }

    get firstName(): CustomerFirstName {
        return this._firstName;
    }

    get lastName(): CustomerLastName {
        return this._lastName;
    }

    get email(): CustomerEmail {
        return this._email;
    }

    get salutation(): CustomerSalutation {
        return this._salutation;
    }
}
