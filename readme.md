# Howestprime Ticketing Microservice

## Overview
This repository contains the TypeScript ticketing microservice for the Howestprime project.

It uses DDD, hexagonal and event driven architecture principles.

It is responsible for handling the process of someone ordering tickets once an opened booking comes in from the message broker.

* **Application Demo**: [Watch a demo of the full application](https://youtu.be/mCZmW9P8Di4)

> **Note**: The client used to actually "buy" the tickets as shown in the demo was not written by me and was
> provided by Howest teaching staff.


## Ecosystem Repositories
* **Backoffice Repository**: [Howestprime Backoffice](https://github.com/Alexander-Engelrelst/howestprime-backoffice)
* **Ticketing Microservice Repository**: [Howestprime Movies Microservice](https://github.com/Alexander-Engelrelst/howestprime-movies)
* **Mobile Application Repository**: [Howestprime Mobile Application](https://github.com/Alexander-Engelrelst/howestprime-mobile)
* **Test environment Repository**: [Howestprime Test Environment](https://github.com/Alexander-Engelrelst/howestprime-infra-test)
* **Production environment Repository**: [Howestprime Production Environment](https://github.com/Alexander-Engelrelst/howestprime-infra-prod)

## Usage
Since this is a project consisting of multiple repositories, trying to run it is not recommended.

To see the full application in action, please watch the [demo video](https://youtu.be/mCZmW9P8Di4)

## Personal Contribution
Everything aside from boilerplate was written by me. The boilerplate was provided by Howest teaching staff.

## Key Highlights
* **Use cases**: Use cases based on hexagonal architecture using abstractions and ensuring all or nothing execution [see example](./src/Application/Ticketing/Orders/CreateOrderFromBookingUseCase.ts) 
* **A guard to ensure monetary safety**: A custom Guard class which is responsible for ensuring that incoming monetary values in euros are safe to convert to cents (which is the unit expected by the application layer) [see code](./src/Infrastructure/WebApi/Shared/CurrencyGuard.ts)
* **Aggregate roots**: This projects followed DDD principles for the domain layer. [see example](./src/Domain/Ticketing/Movies/Movie.ts)