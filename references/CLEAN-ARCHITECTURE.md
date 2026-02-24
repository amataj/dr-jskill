# Clean Architecture (Spring Boot)

## Overview

Use Clean Architecture when you want business rules to stay independent from frameworks, databases, and delivery mechanisms.

Core idea:
- Domain and use cases are the center.
- Outer layers (web, persistence, messaging) depend on inner layers.
- Inner layers never depend on outer layers.

## Dependency Rule

Only point dependencies inward:

1. `infrastructure` -> `application` / `domain`
2. `web` (or adapters) -> `application` / `domain`
3. `application` -> `domain`
4. `domain` -> nothing project-specific

Never do:
- `domain` importing Spring classes
- `application` importing JPA entities directly
- use cases returning framework-specific responses

## Recommended Package Structure

```text
com.example.myapp
|-- domain/
|   |-- model/
|   |-- valueobject/
|   |-- service/
|   |-- exception/
|   `-- port/
|       |-- in/
|       `-- out/
|-- application/
|   |-- usecase/
|   |-- service/        # orchestrates use cases
|   `-- mapper/
|-- infrastructure/
|   |-- security/
|   |   |-- jwt/
|   |   `-- adapter/
|   |-- messaging/
|   |   |-- broker/
|   |   |   |-- producer/
|   |   |   `-- consumer/
|   |   `-- adapter/
|   |-- persistence/
|   |   |-- entity/
|   |   |-- repository/
|   |   `-- adapter/
|   |-- config/
|   `-- external/
`-- web/
    |-- rest/
    |-- dto/
    |-- mapper/
    |-- security/
    `-- advice/
```

## Layer Responsibilities

### Domain
- Business rules and invariants.
- Domain models, value objects, domain services, domain exceptions.
- Defines business-facing ports:
  - input ports (`port.in`) = use case contracts.
  - output ports (`port.out`) = infrastructure contracts.

Domain must not use:
- `@Entity`, `@Repository`, `@RestController`, `ResponseEntity`, etc.

### Application
- Implements use cases.
- Coordinates domain operations and transactions.
- Depends only on domain and ports.
- Contains application services/use case handlers.

### Infrastructure
- Technical implementations of output ports.
- JPA entities/repositories, external API clients, filesystem, messaging.
- Maps persistence entities <-> domain models.
- Security technical components (JWT utilities, password encoders, identity provider adapters).
- Broker adapters (Kafka/RabbitMQ producers and consumers).

### Web (Input Adapter)
- Controllers, request/response DTOs, validation, exception translation.
- Calls input ports from `application`/`domain`.
- Never expose persistence entities directly.
- HTTP security entry points (filter chain, auth endpoints) belong in `web.security`.

## Port Pattern (Hexagonal Style Inside Clean Architecture)

- `port.in`: what the system can do (use cases).
- `port.out`: what the system needs from outside systems.

Example:
- `CreateOrderUseCase` in `port.in`.
- `LoadCustomerPort`, `SaveOrderPort` in `port.out`.
- Infrastructure implements `LoadCustomerPort` and `SaveOrderPort`.
- For brokers: define a publish contract (for example `PublishEventPort`) in `port.out`, implement it in `infrastructure.messaging.broker.producer`.
- For security: define contracts like `CurrentUserPort` / `TokenServicePort` in `port.out`, implement them in `infrastructure.security`.

## Where to Put Security

- `web/security/`
  - HTTP-level security configuration and auth endpoints.
- `infrastructure/security/`
  - JWT/token provider implementation, password hashing, external identity integration.
- `domain` and `application`
  - Authorization rules/use-case checks through ports, without Spring Security types in domain.

## Where to Put Brokers

- `infrastructure/messaging/broker/producer/`
  - Outbound event publishers implementing output ports.
- `infrastructure/messaging/broker/consumer/`
  - Inbound listeners that call use cases via input ports.
- `domain/port/out/`
  - Broker publishing contracts (for example `PublishOrderCreatedEventPort`).
- `domain/port/in/` and `application/usecase/`
  - Use cases invoked by broker consumers.

## Data Modeling Guidance

- Keep domain models framework-agnostic.
- Keep JPA entities in `infrastructure.persistence.entity`.
- Convert between domain and persistence models in dedicated mappers/adapters.
- Prefer immutable value objects where possible.

## Transaction Boundaries

- Put transaction boundaries at use-case/application service level.
- Typical placement: application service methods (`@Transactional`).
- Avoid transactions in controllers.

## Validation Strategy

- Input validation: web DTOs (`jakarta.validation`).
- Business validation: domain model/use case rules.
- Database constraints: infrastructure/JPA schema level.

## Error Handling

- Domain raises domain exceptions.
- Application may translate technical failures into business-friendly outcomes.
- Web layer maps exceptions to HTTP responses via `@RestControllerAdvice`.

## Testing Strategy

1. Domain tests:
   - pure unit tests, no Spring context.
2. Application/use case tests:
   - test with mocked output ports.
3. Adapter tests:
   - controller slice tests, persistence integration tests.
4. End-to-end/integration tests:
   - Spring Boot + PostgreSQL/Testcontainers.

## Spring Boot Conventions for This Skill

- Build tool: Maven only.
- Config file: use `application.yml`.
- DB initialization: `spring.jpa.hibernate.ddl-auto` (no Flyway/Liquibase).
- Do not use Lombok.
- Use PostgreSQL for persistence.

## Minimal Implementation Checklist

1. Define domain model + invariants.
2. Define input and output ports.
3. Implement use cases in application layer.
4. Implement output ports in infrastructure.
5. Add controllers/DTOs in web layer using input ports.
6. Add mappers between DTO <-> domain and entity <-> domain.
7. Add ArchUnit rules to enforce dependency direction.

## Suggested ArchUnit Rules

- `domain..` should not depend on `org.springframework..`
- `domain..` should not depend on `jakarta.persistence..`
- `application..` should not depend on `infrastructure..`
- `web..` should not access `infrastructure.persistence.entity..` directly

## Anti-Patterns to Avoid

- Anemic domain with all logic in controllers/services.
- Passing JPA entities through all layers.
- Adding business logic in repository implementations.
- Tight coupling of use cases to HTTP contracts.
- Bidirectional dependencies between application and infrastructure.
