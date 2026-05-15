import { AddCustomerInformationController } from '@/Infrastructure/WebApi/Controllers/mod.ts';
import { type Router, RouterBuilder, type Routes } from '@/Infrastructure/WebApi/Shared/mod.ts';

export class WebApiRoutes implements Routes {
    map(routerBuilder: RouterBuilder): Router {
        return routerBuilder
            .mapPost(AddCustomerInformationController.name, '/api/orders/:orderId/customer')
            .build();
    }
}
