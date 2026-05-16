import {
    MongoDbClient,
    MongoDbRepository,
} from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { OrderDocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';

export class MongoDbOrderRepository extends MongoDbRepository<Order, OrderId>
    implements OrderRepository {
    static override readonly collectionName: string = 'orders';

    constructor(
        client: MongoDbClient,
        mapper: OrderDocumentMapper,
    ) {
        super(client, mapper, MongoDbOrderRepository.collectionName);
    }

    override get entityName(): string {
        return Order.name;
    }
}
