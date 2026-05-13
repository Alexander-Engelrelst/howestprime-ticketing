export class OrderId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): OrderId {
        return new OrderId(value);
    }
}

export class Order extends AggregateRoot<OrderId> {
    private readonly _tickets: Ticket[];