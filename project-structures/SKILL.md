---
name: project-structures
description: "Defines and applies supported Spring Boot project layouts: frontend-only, backend-only, single-module webapp, and split frontend/backend modules."
---

# Project Structures Skill

## Purpose

Use this skill when the user wants to choose, create, or refactor a project structure.

## Required Interaction

Before creating or moving files, ask in this order:

1. **"What type of project?"**
   - `1- Frontend`
   - `2- Backend`
   - `3- Frontend + Backend`
2. If user selects `3- Frontend + Backend`, ask:
   - **"How should frontend and backend be structured?"**
   - `1- Frontend and backend as separate modules under one parent`
   - `2- Frontend under src/main/webapp`
3. If project type includes frontend (`1` or `3`), ask:
   - **"What is the Frontend Technology?"**
   - `1- Angular`
   - `2- React`
   - `3- Vue`
   - `4- Vanilla-JS`
4. Wait for confirmation, then apply the selected layout exactly.

## Rules

- Build tool is Maven only.
- Keep Spring Boot conventions from `dr-jskill`.
- Do not mix structures in one generation step.
- If structure is unclear, ask one follow-up question and pause.
- For `Frontend + Backend`: map structure choice as:
  - `1` -> `split-modules-same-level`
  - `2` -> `single-module-webapp`

## Layout Reference

- Read `references/STRUCTURE.md` in this skill folder for the canonical trees.
- Treat those trees as source of truth for directory layout.

## Validation

After applying a structure:

1. Ensure expected module folders and `pom.xml` files exist.
2. Run Maven validation from the correct root:
   - Single module: `./mvnw -q -DskipTests package`
   - Multi-module: root `./mvnw -q -DskipTests package`
