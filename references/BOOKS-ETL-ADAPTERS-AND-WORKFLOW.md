# Books ETL Adapters And Workflow

## REST Adapter Pattern

Generate REST controllers in:

```text
interfaces/web/rest/
```

Controller rules:
- depend on `application.<feature>.<Feature>UseCase`,
- return API-facing DTOs or domain models only when the API is intentionally simple,
- keep HTTP validation and response assembly in the controller layer,
- do not inject Spring Data repositories directly.

If existence checks are needed for update flows, expose `exists(id)` from the use case instead of bypassing the architecture.

## Use-Case Implementation Pattern

Use-case implementations live in:

```text
application/<feature>/impl/
```

Rules:
- annotate with `@Service`,
- put `@Transactional` here,
- use domain services for mutations,
- use query ports for reads,
- translate between `Pageable` and `PageCriteria`,
- keep them stateless.

## JPA Adapter Pattern

Persistence is split into four parts:

### `entity`
- JPA-only persistence models

### `repository`
- Spring Data interfaces

### `mapper`
- MapStruct mappers from entity to domain and back

### `adapter`
- concrete implementations of `*CommandRepository` and `*QueryRepository`

Recommended implementation rule:
- one `*JpaAdapter` may implement both the command and query port for a feature.

Example:

```text
BookJpaAdapter implements BookCommandRepository, BookQueryRepository
```

## Bean Wiring Pattern

Keep domain services free of Spring stereotypes when possible, then wire them explicitly:

```text
infrastructure/config/BeanConfiguration.java
```

Typical bean creation:
- `BookService(BookCommandRepository, BookQueryRepository)`
- `BookFileService(BookFileCommandRepository, BookFileQueryRepository)`
- `IngestRunService(IngestRunCommandRepository, IngestRunQueryRepository)`

This gives a clear composition root and makes the dependency direction visible.

## Workflow Slice

If the project needs asynchronous orchestration, add:

```text
workflow/
|-- <Business>Workflow.java
|-- <Business>WorkflowImpl.java
`-- activities/
    |-- <Business>Activities.java
    `-- <Business>ActivitiesImpl.java
```

Use this for:
- multi-step document processing,
- OCR and parsing pipelines,
- event publication after validation,
- retryable external interactions.

Keep workflow logic separate from the CRUD layers.

## External Integration Placement

Place integrations by technical concern:
- message broker publishers/listeners in `infrastructure.broker`
- OCR components in `infrastructure.ocr`
- file watchers or filesystem adapters in `infrastructure.fs`
- parsers in `infrastructure.parser`
- Temporal or workflow runtime configuration in `workflow.infrastructure.config` or `infrastructure.config`

## Testing Expectations

Generate tests that enforce the architecture:

- ArchUnit rules for package boundaries
- use-case tests with mocked ports
- JPA adapter integration tests
- controller tests
- workflow tests for orchestration-heavy flows

Do not leave the ArchUnit test empty.
