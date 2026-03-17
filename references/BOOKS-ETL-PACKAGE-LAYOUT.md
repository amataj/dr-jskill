# Books ETL Package Layout

## Canonical Backend Layout

Generate the backend packages like this:

```text
src/main/java/com/example/myapp/
|-- MyApp.java
|-- application/
|   |-- package-info.java
|   |-- <feature>/
|   |   |-- <Feature>UseCase.java
|   |   `-- impl/
|   |       `-- <Feature>UseCaseImpl.java
|-- domain/
|   |-- <feature>/
|   |   |-- <Feature>.java
|   |   |-- <Feature>CommandRepository.java
|   |   |-- <Feature>QueryRepository.java
|   |   `-- <Feature>Service.java
|-- infrastructure/
|   |-- config/
|   |   `-- BeanConfiguration.java
|   |-- database/
|   |   `-- jpa/
|   |       |-- adapter/
|   |       |   `-- <Feature>JpaAdapter.java
|   |       |-- entity/
|   |       |   `-- <Feature>Entity.java
|   |       |-- mapper/
|   |       |   `-- <Feature>Mapper.java
|   |       `-- repository/
|   |           `-- <Feature>JpaRepository.java
|   |-- broker/
|   |-- parser/
|   |-- ocr/
|   |-- fs/
|   |-- mail/
|   `-- logging/
|-- interfaces/
|   `-- web/
|       |-- rest/
|       |   `-- <Feature>Resource.java
|       `-- rest/errors/
|-- shared/
|   |-- pagination/
|   |   |-- PageCriteria.java
|   |   `-- PageResult.java
|   |-- ingest/
|   |-- security/
|   `-- management/
`-- workflow/
    |-- <Business>Workflow.java
    |-- <Business>WorkflowImpl.java
    `-- activities/
```

## Feature Slicing Rules

Each business feature should be represented consistently across layers:

- `domain.book`
- `application.book`
- `interfaces.web.rest.BookResource`
- `infrastructure.database.jpa.*Book*`

Apply the same pattern for:
- `bookfile`
- `bookpage`
- `ingestrun`
- `ingestevent`
- any new aggregate introduced later

## Naming Rules

- Domain model: `<Feature>`
- Domain service: `<Feature>Service`
- Write port: `<Feature>CommandRepository`
- Read port: `<Feature>QueryRepository`
- Use-case boundary: `<Feature>UseCase`
- Use-case implementation: `<Feature>UseCaseImpl`
- JPA entity: `<Feature>Entity`
- Spring Data repository: `<Feature>JpaRepository`
- JPA adapter: `<Feature>JpaAdapter`
- REST controller: `<Feature>Resource`

## What Goes Where

### Put in `domain`
- Aggregate data and business rules
- Repository port interfaces
- Domain services
- Feature-specific exceptions

### Put in `application`
- Transaction boundaries
- CRUD orchestration
- Pagination adaptation between Spring and shared primitives
- Existence checks and read/write coordination

### Put in `infrastructure`
- JPA mappings
- Liquibase or database config if the project uses schema migration
- Repository adapter implementations
- External parser/OCR/filesystem/broker clients
- Bean wiring that composes domain services from ports

### Put in `interfaces`
- REST endpoints
- HTTP validation
- exception-to-response translation
- SSE/web concerns if present

### Put in `shared`
- Pagination abstractions
- Common constants
- Cross-feature messages/payloads
- Security and management helpers

### Put in `workflow`
- Long-running business process coordination
- Workflow activity interfaces and implementations

## Generation Advice

When generating from scratch:
- create all top-level packages early,
- generate one complete vertical slice for the first feature,
- then repeat the same pattern for other features,
- and add an ArchUnit test immediately so the structure does not drift.
