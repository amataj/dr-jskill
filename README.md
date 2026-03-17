# Dr JSkill

<table>
  <tr>
    <td>
      <p><strong>An Agent Skill for creating Spring Boot applications following Julien Dubois' best practices.</strong></p>
      <p>Generate Spring Boot 4.x projects with Java 25, PostgreSQL, Docker support, and your choice of front-end framework (Vue.js, React, Angular, or Vanilla JS).</p>
      <p>Dr JSkill is an agent skill: it is meant to work with tools like Codex, GitHub Copilot CLI, or Claude Code.
      </p>
    </td>
    <td align="right" valign="middle" width="340">
      <img src="./dr-jskill-small.png" alt="Dr JSkill logo" width="320" />
    </td>
  </tr>
</table>

## Video Introduction

<a href="https://youtu.be/Z8tWJ0NTy08">
  <img src="https://img.youtube.com/vi/Z8tWJ0NTy08/hqdefault.jpg" alt="Dr JSkill Video" width="480" />
</a>

## What This Skill Provides

- **Automated project generation** from https://start.spring.io with the latest available Spring Boot version
- **Docker-ready** applications with standard and native image builds
- **Multiple front-end options**: Vue.js (default), React, Angular, or Vanilla JS
- **Production-ready** configurations with PostgreSQL, REST APIs, and monitoring

## Comparison with JHipster

[JHipster](https://jhipster.tech) is an awesome Spring Boot application generator, also created by Julien Dubois.

Dr JSkill builds on the JHipster experience:

- It generates applications that should be similar to what JHipster creates
- It is closer to Julien Dubois' tastes, as JHipster is ultimately the work of hundreds of people
- Dr JSkill is an AI agent: it is not deterministic, it is slower and can cost some money to execute. But it is easier to tune, more versatile, and can update projects easily.

At the moment, Dr JSkill is an experiment. If it is successful, it might join the JHipster organization.

## Sample usage

Here is an example you can use to try out this skill with an AI assistant like GitHub Copilot CLI .

To create a new project:
```
Use Dr JSkill to create a new Todo List application.

- Features: add/edit/remove todos
- A fancy UI with nice effects
- Data stored in a database
- No security
``` 

Once the project is created, you can ask the assistant to add features, for example:
```
I want to assign those todos to users, but I don't want to implement authentication. Can you use a simple user management system with hardcoded users in the database?
There would be a dropdown to select the user when creating a todo, and the list of todos would be filtered by user.
User names are: julien, alice, bob.
```

## Documentation

For complete documentation, usage instructions, and best practices, see **[SKILL.md](SKILL.md)**.

Additional references:
- [Project Setup & Dotfiles](references/PROJECT-SETUP.md)
- [Front-end Development Guides](references/) (Vue.js, React, Angular, Vanilla JS)
- [Database Best Practices](references/DATABASE.md)
- [Docker Deployment](references/DOCKER.md)
- [Testing Guide](references/TEST.md)
- [Azure Deployment](references/AZURE.md)
- [Books ETL Architecture Profile](references/BOOKS-ETL-ARCHITECTURE.md)
- [Books ETL Package Layout](references/BOOKS-ETL-PACKAGE-LAYOUT.md)
- [Books ETL Domain Patterns](references/BOOKS-ETL-DOMAIN-PATTERNS.md)
- [Books ETL Adapters And Workflow](references/BOOKS-ETL-ADAPTERS-AND-WORKFLOW.md)
- [Books ETL Generation Checklist](references/BOOKS-ETL-GENERATION-CHECKLIST.md)
- **Versions manifest:** `versions.json` (read by `scripts/lib/versions.mjs`). Update this file first when bumping any tool/library version.

## Using This Skill with AI Assistants

This is an [Agent Skill](https://agentskills.io) that can be used with AI coding assistants that support the Agent Skills specification.

### Fork or clone this repository

In order to use this skill, and modify it to your needs, you can fork this repository on GitHub, or simply clone it to your local machine.

#### Forking on GitHub

**Using the GitHub website:**
1. Navigate to the repository on GitHub
2. Click the "Fork" button in the top-right corner
3. Select your account as the destination
4. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dr-jskill.git
   ```

**Using the GitHub CLI:**
1. Install the [GitHub CLI](https://cli.github.com/) if you haven't already
2. Fork and clone in one command:
   ```bash
   gh repo fork jdubois/dr-jskill --clone
   ```
   This will fork the repository to your GitHub account and clone it to your local machine.

#### Just cloning (without forking)

If you only want to use the skill locally without maintaining your own fork:
```bash
git clone https://github.com/jdubois/dr-jskill.git
```

### GitHub Copilot CLI

Configure skills for GitHub Copilot CLI by placing them in the skills directory:

1. Create the skills directory if it doesn't exist:
   ```bash
   mkdir -p ~/.github-copilot/skills
   ```

2. Clone or copy this skill to the skills directory:
   ```bash
   git clone <repository-url> ~/.github-copilot/skills/dr-jskill
   # Or copy: cp -r /path/to/dr-jskill ~/.github-copilot/skills/
   ```

3. Use GitHub Copilot CLI as usual - the skill will be automatically loaded:
   ```bash
   gh copilot suggest "create an application using the dr-jskill"
   ```

The skill will be available for all `gh copilot` commands.

### GitHub Copilot (VS Code)

1. Open VS Code Settings (`Cmd+,` on macOS or `Ctrl+,` on Windows/Linux)
2. Search for `github.copilot.chat.codeGeneration.instructions`
3. Click "Edit in settings.json"
4. Add a skill entry:
   ```json
   {
     "github.copilot.chat.codeGeneration.instructions": [
       {
         "file": "/absolute/path/to/dr-jskill/SKILL.md"
       }
     ]
   }
   ```
5. Restart VS Code for changes to take effect

Alternatively, you can enable skills globally by placing them in a specific directory:
- macOS/Linux: `~/.github-copilot/skills/`
- Windows: `%USERPROFILE%\.github-copilot\skills\`

### Claude Code / Windsurf (VS Code)

Skills are automatically discovered from configured skill directories.

1. Clone or copy this skill to a directory on your system:
   ```bash
   git clone <repository-url> ~/skills/dr-jskill
   ```

2. Configure the skills directory in VS Code Settings:
   - Open Settings (`Cmd+,` or `Ctrl+,`)
   - Search for "skills" or look for your assistant's skill configuration
   - Add the path to your skills directory: `~/skills/`

3. Restart VS Code

Claude Code will automatically discover all skills in the configured directory and load them when relevant to your task.

### Codex

Codex loads skills from `$CODEX_HOME/skills` (default: `~/.codex/skills`). The skill directory must be named `dr-jskill`.

**Option A — Use a local clone (e.g. this repo):**

1. Create the skills directory and link or copy the skill root (the folder that contains `SKILL.md`, `scripts/`, `references/`, `assets/`):
   ```bash
   mkdir -p ~/.codex/skills
   ln -s "/path/to/your/dr-jskill/clone" ~/.codex/skills/dr-jskill
   ```
   Or copy instead of symlinking:
   ```bash
   mkdir -p ~/.codex/skills
   cp -R "/path/to/your/dr-jskill/clone" ~/.codex/skills/dr-jskill
   ```

**Option B — Install from GitHub:**

Run the install script from this repo (installs [amataj/dr-jskill](https://github.com/amataj/dr-jskill) into `~/.codex/skills/dr-jskill`):
   ```bash
   ./scripts/install-dr-jskill-codex.sh              # default: main branch
   ./scripts/install-dr-jskill-codex.sh -b main     # explicit branch
   ./scripts/install-dr-jskill-codex.sh -b backend_module_same_level_as_frontend
   ```
   Use `--force` to replace an existing installation:
   ```bash
   ./scripts/install-dr-jskill-codex.sh --force
   ./scripts/install-dr-jskill-codex.sh -b my-branch --force
   ```
   Alternatively, if you have the Codex skill-installer, you can install from any repo/branch:
   ```bash
   python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo amataj/dr-jskill --ref main
   ```

2. **Restart Codex** so it picks up the new skill.

3. **Create a project** by asking Codex in natural language, for example:
   - *"Use dr-jskill to create a new Spring Boot project."*
   - *"Create a new Todo List app with Dr JSkill — add/edit/remove todos, store in DB, no security."*
   - *"Use the Spring Boot skill to generate a full-stack app named myapp, group com.myco, with Vue frontend."*

   Codex will use the skill’s instructions and run the creation script (e.g. `node scripts/create-project-latest.mjs ...`) from the skill directory. The new project is created in the **current working directory** where you invoked Codex.

4. **Run the generated application:**
   ```bash
   cd <project-name>
   ./mvnw spring-boot:run
   ```
   For fullstack projects, PostgreSQL starts automatically via Docker Compose when you run the app.

### Other Compatible Assistants

This skill follows the [Agent Skills specification](https://agentskills.io/specification) and works with any compatible AI assistant. Refer to your assistant's documentation for configuration instructions.

## Requirements

- Node.js 22.x and npm 10.x
- Java 25
- Docker (for containerized deployments)

## License

This project is licensed under the Apache License 2.0.

See [LICENSE](LICENSE) file for details.
