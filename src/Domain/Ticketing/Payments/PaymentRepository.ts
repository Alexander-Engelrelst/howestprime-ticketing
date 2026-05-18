import { Repository } from '@/Domain/Shared/mod.ts';
import { Payment, PaymentId } from '@/Domain/Ticketing/Payments/mod.ts';

export interface OrderRepository extends Repository<Payment, PaymentId> {}