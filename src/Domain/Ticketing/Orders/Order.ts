import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';

export class OrderId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): OrderId {
        return new OrderId(value);
    }
}

export class Order extends AggregateRoot<OrderId> {


    private constructor(id: OrderId) {
        super(id);
    }

    static create(): Order {
        return new Order(OrderId.create());
    }
}