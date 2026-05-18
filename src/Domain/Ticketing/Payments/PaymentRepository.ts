import { Repository } from '@/Domain/Shared/mod.ts';
import { Payment, PaymentId } from '@/Domain/Ticketing/Payments/mod.ts';

export interface PaymentRepository extends Repository<Payment, PaymentId> {}