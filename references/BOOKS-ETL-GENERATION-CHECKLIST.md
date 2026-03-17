# Books ETL Generation Checklist

Use this checklist when generating a new project with the `books-etl` architecture profile.

## Step 1

Create backend packages:
- `application`
- `domain`
- `infrastructure`
- `interfaces`
- `shared`
- optional `workflow`

## Step 2

For each aggregate:
- create the domain model
- create `CommandRepository`
- create `QueryRepository`
- create the domain service
- create the use-case interface
- create the use-case implementation
- create the JPA entity
- create the Spring Data repository
- create the mapper
- create the JPA adapter
- create the REST resource

## Step 3

Create shared primitives:
- `PageCriteria`
- `PageResult`
- common constants
- ingest payload/value classes if the project is ETL-oriented

## Step 4

Create the composition root:
- `infrastructure.config.BeanConfiguration`

Wire:
- domain services from domain ports
- use cases from domain services and query ports

## Step 5

If the project processes documents asynchronously:
- add the `workflow` package
- create workflow contracts
- create activity contracts and implementations
- keep workflow orchestration out of REST controllers

## Step 6

Add verification:
- ArchUnit structure test
- unit tests for domain and use cases
- adapter integration tests

## Non-Negotiable Rules

- `domain` must not depend on JPA entities.
- `interfaces` must not depend on Spring Data repositories.
- `application` owns transactions.
- `infrastructure` implements ports and contains no business logic.
- `shared` contains reusable primitives, not feature-specific orchestration.
