# Supported Project Structures

This document defines the supported project layouts.

## 1) Frontend-only (Maven-managed)

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
- Select one structure before generation.
- Keep frontend and backend paths consistent with the chosen layout.

