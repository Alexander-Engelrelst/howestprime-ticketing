import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { OrderNotFoundApplicationException } from '@/Application/Shared/mod.ts';
import {
    Customer,
    CustomerEmail,
    CustomerFirstName,
    CustomerLastName,
    CustomerSalutation,
    Order,
    OrderId,
    OrderRepository,
} from '@/Domain/Ticketing/Orders/mod.ts';

export interface AddCustomerToOrderUseCaseInput {
    orderId: string;
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    agreeToTerms: boolean;
}

export class AddCustomerToOrderUseCase implements UseCase<AddCustomerToOrderUseCaseInput, string> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: AddCustomerToOrderUseCaseInput): Promise<string> {
        this._logger.debug('Adding customer information to order', { input });
        const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);

        const orderOpt = await orderRepository.byId(OrderId.create(input.orderId));

        if (!orderOpt.isPresent) {
            throw new OrderNotFoundApplicationException(input.orderId);
        }

        const order = orderOpt.value;
        const customer = Customer.create(
            CustomerFirstName.create(input.firstName),
            CustomerLastName.create(input.lastName),
            CustomerEmail.create(input.email),
            CustomerSalutation.create(input.salutation),
        );

        if (input.agreeToTerms) {
            order.acceptTerms();
        }

        order.assignCustomer(customer);

        return await this._unitOfWork.do(async () => {
            await this._unitOfWork.save(order);

            this._logger.info('Customer information added to order', {
                orderId: order.id.value,
                customerEmail: customer.email.value,
                customerFirstName: customer.firstName.value,
                customerLastName: customer.lastName.value,
                customerSalutation: customer.salutation.value,
            });

            return order.id.value;
        });
    }
}
