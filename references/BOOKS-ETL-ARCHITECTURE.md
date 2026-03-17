# Books ETL Architecture Profile

## Purpose

Use this profile when generating a Spring Boot application that should follow the same backend architecture shape as `books-etl`.

This is not a generic clean architecture template. It is a pragmatic, JHipster-compatible variant with these top-level backend packages:

```text
com.example.myapp
|-- application/
|-- domain/
|-- infrastructure/
|-- interfaces/
|-- shared/
`-- workflow/
```

## Architecture Style

The intended dependency direction is:

```text
interfaces -> application -> domain <- infrastructure
                         ^
                         |
                       shared
```

Additional notes:
- `workflow` is a separate integration slice for Temporal-style orchestration.
- `shared` contains cross-cutting primitives used by multiple slices.
- `domain` owns business-facing models, repository ports, and domain services.
- `application` owns Spring-managed use-case orchestration.
- `infrastructure` owns JPA, external systems, technical configuration, and adapter implementations.
- `interfaces` owns HTTP/web entrypoints and request/response concerns.

## Package Intent

### `domain`
- Framework-light business layer.
- Domain models live per feature package: `domain.book`, `domain.bookfile`, `domain.ingestrun`, etc.
- Split repository ports into:
  - `*CommandRepository` for writes
  - `*QueryRepository` for reads
- Domain services are concrete classes such as `BookService`, `BookFileService`.

### `application`
- Defines adapter-facing use-case interfaces such as `BookUseCase`.
- Implements them in `application.<feature>.impl`.
- Handles transactions, pagination adaptation, existence checks, and orchestration.

### `infrastructure`
- Houses database adapters, entities, mappers, technical config, mail, parser, OCR, filesystem, broker integrations, and AOP/logging support.
- JPA port implementations live in `infrastructure.database.jpa.adapter`.
- Spring Data repositories live in `infrastructure.database.jpa.repository`.
- JPA entities live in `infrastructure.database.jpa.entity`.
- MapStruct mappers live in `infrastructure.database.jpa.mapper`.
- Explicit bean composition belongs in `infrastructure.config.BeanConfiguration`.

### `interfaces`
- HTTP and web concerns only.
- REST controllers live in `interfaces.web.rest`.
- Web configuration lives in `interfaces.web`.
- Controllers call `application` use cases, not domain repositories.
- Avoid direct infrastructure dependencies from controllers; if a generated CRUD controller needs an existence check, add that method to the use case instead of injecting a JPA repository.

### `shared`
- Cross-cutting primitives that are not business features.
- Keep things like pagination, constants, ingest payload records, security helpers, and management utilities here.

### `workflow`
- Separate package for long-running orchestration using Temporal or similar workflow engines.
- Keep workflow contracts and activity interfaces here.
- Workflow implementations may call infrastructure-backed activities, but they should stay outside the main CRUD package hierarchy.

## Architectural Conventions To Preserve

- Use feature-first packages under `application`, `domain`, and `interfaces`.
- Keep repository ports in `domain`, with adapter implementations in `infrastructure`.
- Prefer explicit constructor injection.
- Keep `BeanConfiguration` as the place where domain services are assembled from ports.
- Keep `application` interfaces small and adapter-focused.
- Use `shared.pagination.PageCriteria` and `shared.pagination.PageResult` when domain read ports should avoid Spring Data types.
- Keep JPA entities out of `domain` and `interfaces` contracts.

## Known Gaps In The Current Books ETL Codebase

The current `books-etl` codebase is still mid-migration. When generating a fresh project from this profile, improve on these weaknesses:

- Do not import JPA entities inside domain models.
- Do not inject Spring Data repositories directly into REST controllers.
- Do not leave `TechnicalStructureTest` effectively empty; add real layer assertions.
- Prefer domain validation exceptions over `IllegalArgumentException`.
- Keep domain classes as framework-free as practical.

## Generation Target

When a user asks for "the books-etl architecture", generate a codebase that preserves:
- the package layout,
- the command/query repository split,
- the application use-case layer,
- explicit infrastructure adapters,
- shared pagination primitives,
- and an optional workflow slice for asynchronous orchestration.
