# Generic LLM Orchestration Pack

This is a **project-agnostic** orchestration pack for working with LLMs on
complex projects (games, apps, tools, backends, etc.).

It gives you:

- A **Master Orchestrator** prompt for a supervising LLM.
- A set of **specialist role prompts** (architect, core logic, UI/UX, events/monetization, content, notetaker).
- A **notes template** and an **environment constraints template**.

You can drop this into any repo (e.g. at `llm/` or `docs/llm/`), lightly customize,
and then point your LLM / coding agent at the prompts inside.

## Structure

- `orchestrator/`
  - `MASTER_ORCHESTRATOR_PROMPT.md`
  - `EXECUTE_MASTER_ORCHESTRATOR_PROMPT.md`
- `roles/`
  - `01_ARCHITECT_SYSTEMS.md`
  - `02_CORE_LOGIC_SYSTEMS.md`
  - `03_UI_UX_FRONTEND.md`
  - `04_EVENTS_LIFECYCLE_MONETIZATION.md`
  - `05_CONTENT_COPY.md`
  - `06_NOTETAKER_TRACKER.md`
- `references/`
  - `README_REFERENCES.md`
  - `LLM_NOTES_TEMPLATE.md`
- `env/`
  - `SPECIAL_ENVIRONMENTS_TEMPLATE.md`

## How to adapt for a specific project

1. Decide where this lives in your repo, e.g. `llm/`.
2. Replace generic placeholders like:
   - `PROJECT_NAME`
   - `PROJECT_TYPE` (game, web app, CLI tool, etc.)
   - `PRIMARY_TECH_STACK`
3. Fill out `env/SPECIAL_ENVIRONMENTS_TEMPLATE.md` with your actual stack and constraints.
4. Copy `references/LLM_NOTES_TEMPLATE.md` to `references/LLM_NOTES.md` and keep it updated.
5. Start a new LLM session with the contents of `orchestrator/EXECUTE_MASTER_ORCHESTRATOR_PROMPT.md`.

The prompts are written to be **safe defaults**:

- They assume modern tooling & LLM access, but will still work with simple copy-paste.
- They encourage small, incremental changes, clear docs, and a centralized notes file.
