# Books ETL Domain Patterns

## Aggregate Shape

The `books-etl` domain centers on these aggregates:

- `Book`
- `BookFile`
- `BookPageText`
- `IngestRun`
- `IngestEvent`

Typical relationships:
- `Book` is the aggregate root.
- `BookFile` belongs to `Book` through `documentId` or `bookId`.
- `BookPageText` belongs to `Book` and enforces `pageNo >= 1`.
- `IngestEvent` references an `IngestRun`.

## Domain Model Guidance

For fresh generation, improve the current codebase and keep domain models framework-free:

- Use plain Java classes or records where practical.
- Keep validation and invariants in domain methods or constructors.
- Do not reference JPA entities from domain classes.
- Do not annotate domain models with JPA annotations.
- Use identity-based `equals` and `hashCode`.

Suggested fields:

### `Book`
- `id`
- `documentId`
- `title`
- `author`
- `lang`
- `pages`

### `BookFile`
- `id`
- `documentId`
- `pathNorm`
- `sha256`
- `sizeBytes`
- created/updated timestamps if needed

### `BookPageText`
- `id`
- `documentId`
- `pageNo`
- `text`

### `IngestRun`
- `id`
- `startedAt`
- `finishedAt`
- `status`
- counter fields with non-negative validation

### `IngestEvent`
- `id`
- `runId`
- `documentId`
- `topic`
- `payload`
- `createdAt`

## Port Split

Each aggregate gets two repository ports:

### Command port

Owns mutations, for example:
- `save`
- `deleteById`

### Query port

Owns reads, for example:
- `findById`
- `findByDocumentId`
- `findByTitle`
- `findAll(PageCriteria)`

This keeps use-case orchestration explicit and matches the current `books-etl` package design.

## Domain Service Pattern

Create one concrete domain service per aggregate:

```text
domain/book/BookService.java
domain/bookfile/BookFileService.java
domain/bookpage/BookPageTextService.java
domain/ingestrun/IngestRunService.java
domain/ingestevent/IngestEventService.java
```

Responsibilities:
- validate aggregate invariants,
- coordinate read-before-write checks using query ports,
- perform mutations through command ports,
- keep business logic out of adapters.

Prefer custom domain exceptions instead of `IllegalArgumentException`.

## Shared Pagination Pattern

Read ports should avoid Spring Data types directly. Use shared types like:

```text
shared/pagination/PageCriteria
shared/pagination/PageResult<T>
```

This lets:
- `domain` stay decoupled from Spring Data,
- `application` translate to and from `Pageable` and `Page<T>`,
- `infrastructure` handle JPA-specific pagination.
