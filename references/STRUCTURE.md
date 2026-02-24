# Supported Project Structures

This document defines the supported project layouts for generated projects.

## 1) Frontend-only (Maven-managed)

Use this when the project is only a front-end application packaged with Maven.

```text
frontend-project-root/
|-- pom.xml
|-- src/
|   |-- index.html
|   `-- ...
|-- package.json
`-- .gitignore
```

## 2) Backend-only (Spring Boot)

Use this for API/services without a separate front-end module.

```text
backend-project-root/
|-- pom.xml
`-- src/
    |-- main/
    |   |-- java/
    |   `-- resources/
    `-- test/
```

## 3) Single module: backend + frontend in `src/main/webapp`

Use this when front-end assets are maintained inside the Spring Boot module.

```text
project-root/
|-- pom.xml
`-- src/
    |-- main/
    |   |-- java/
    |   |-- resources/
    |   `-- webapp/
    |       |-- index.html
    |       |-- package.json
    |       `-- .gitignore
    `-- test/
```

## 4) Multi-module: frontend and backend at same level

Use this when frontend and backend are separated into sibling modules.

```text
project-root/
|-- pom.xml
|-- frontend/
|   |-- pom.xml
|   |-- src/
|   |   `-- ...
|   |-- package.json
|   `-- .gitignore
`-- backend/
    |-- pom.xml
    `-- src/
        |-- main/
        |   |-- java/
        |   `-- resources/
        `-- test/
```

## Notes

- Build tool is Maven only.
- `frontend/` is optional and depends on selected structure.
- Choose one of the four layouts above before generation to keep scripts and templates consistent.
