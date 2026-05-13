import { Repository } from '@/Domain/Shared/mod.ts';
import { Order, OrderId } from '@/Domain/Ticketing/Orders/Order.ts';

export interface OrderRepository extends Repository<Order, OrderId> {}
