# Layered Architecture (Spring Boot)

## Overview

This layered style follows the structure shown in your screenshot (JHipster-like package layout under `app`).

Primary layers:
1. `web` (presentation/API)
2. `service` (application/business orchestration)
3. `repository` (data access)
4. `domain` (entities/core model)

Cross-cutting packages:
- `security`
- `config`
- `aop`
- `management`

## Dependency Direction

Use this direction:
- `web` -> `service`
- `service` -> `repository` and `domain`
- `repository` -> `domain`
- `security` may be used by `web` and `service`

Avoid:
- `repository` calling `web`
- `domain` depending on `web` classes
- controllers with business logic

## Recommended Package Structure (Screenshot-Based)

```text
com.example.myapp.app
|-- aop/
|-- config/
|-- domain/
|   |-- AbstractAuditingEntity.java
|   |-- Authority.java
|   |-- User.java
|   `-- package-info.java
|-- management/
|-- repository/
|   |-- AuthorityRepository.java
|   |-- UserRepository.java
|   `-- package-info.java
|-- security/
|   |-- AuthoritiesConstants.java
|   |-- DomainUserDetailsService.java
|   |-- SecurityUtils.java
|   |-- SpringSecurityAuditorAware.java
|   |-- UserNotActivatedException.java
|   `-- package-info.java
|-- service/
|   |-- dto/
|   |-- mapper/
|   |-- MailService.java
|   |-- UserService.java
|   |-- EmailAlreadyUsedException.java
|   |-- InvalidPasswordException.java
|   |-- UsernameAlreadyUsedException.java
|   `-- package-info.java
|-- web/
|   |-- filter/
|   `-- rest/
|-- ApplicationWebXml.java
|-- GeneratedByJHipster.java
|-- HomeApp.java
`-- package-info.java
```

## Layer Responsibilities

### `web`
- REST controllers and HTTP filters.
- Request/response mapping and validation.
- Delegates business actions to `service`.

### `service`
- Business orchestration and transactional use cases.
- Uses `repository` for persistence access.
- Hosts DTO and mapper packages.

### `repository`
- Spring Data repository interfaces.
- Query-level persistence access.

### `domain`
- Entities and core domain state.
- Auditing base entities and model relationships.

### `security`
- Spring Security integration and user details lookup.
- Authorization constants/utilities and auditor provider.

## Where to Put Brokers

The screenshot structure does not include brokers. For messaging, add them as a separate package under `app`:

```text
com.example.myapp.app
`-- broker/
    |-- producer/
    `-- consumer/
```

Guideline:
- `broker/consumer` -> calls `service`
- `service` -> can call `broker/producer` for outbound events

## Transaction Boundaries

- Put `@Transactional` in `service` methods.
- Keep controllers thin (no transaction logic in `web`).

## Testing Strategy

1. `web` slice tests (`@WebMvcTest`)
2. `service` unit tests (mock repositories)
3. `repository` integration tests
4. full integration tests with PostgreSQL/Testcontainers

## Spring Boot Conventions for This Skill

- Build tool: Maven only.
- Config file: `application.yml`.
- Database initialization: `spring.jpa.hibernate.ddl-auto`.
- Do not use Lombok.
- Use PostgreSQL.

