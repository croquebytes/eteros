# Special Environments & Constraints – Template (Generic)

Use this file to describe **special environments, tools, and constraints** that LLMs
should respect when working on **`PROJECT_NAME`**.

Fill in whatever is relevant; leave sections blank if not applicable.

---

## 1. Project & Targets

- Project name: `PROJECT_NAME`
- Project type: (game, web app, CLI, backend, library, etc.)

- Target platforms:
  - [ ] Browser (desktop)
  - [ ] Browser (mobile)
  - [ ] Mobile app (iOS / Android)
  - [ ] Desktop app
  - [ ] Server / backend service
  - [ ] Other: …

Notes:
- Primary target:
- Secondary/future targets:

## 2. Runtime & Frameworks

- Primary runtime:
  - (e.g. Node.js, browser, Python, JVM, etc.)
- Frameworks allowed:
  - (e.g. React, Vue, Django, FastAPI, none, etc.)
- Frameworks to avoid:
  - (e.g. avoid heavy frameworks in the core, etc.)

## 3. Build & Tooling

- Build tools:
  - (e.g. Vite, Webpack, esbuild, none)
- Package manager:
  - (e.g. npm, pnpm, yarn, pip, poetry)
- Testing frameworks:
  - (e.g. Jest, Vitest, pytest, Go test)
- CI/CD:
  - (e.g. GitHub Actions, GitLab CI, CircleCI)

## 4. Performance, Security & Size Constraints

- Performance:
  - (e.g. request latency targets, FPS goals)
- Security:
  - (e.g. compliance requirements, auth model)
- Size:
  - (e.g. bundle size targets, memory limits)

## 5. LLM Environment Notes

- Typical model(s) used:
  - (e.g. GPT-5.1 Thinking, Claude, etc.)
- Available tools:
  - (e.g. file system access, code execution, browser access)
- Token/context limits to keep in mind:

## 6. Anything to Avoid

- Libraries / patterns to avoid:
- Areas of the codebase to avoid for now:
- Other “do not touch” notes:

---

Keep this file updated as your environment evolves. The **Master Orchestrator** and other
role prompts should check this file (or its contents) when deciding how to implement changes.
