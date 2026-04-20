# Copilot Instructions

## Core Behavior
- Always prioritize maintainability, clarity, and correctness over shortcuts
- Treat the repository as a long-running, evolving project
- Do not make isolated changes without considering the full codebase

---

## Project Awareness & Continuity
- Always review existing code before making changes
- Maintain consistency with established patterns and architecture
- Avoid duplicating functionality unless explicitly required
- Ensure new changes integrate cleanly with existing modules

---

## Understanding Awareness (CRITICAL)
- Before making any code change, always check `understanding.md` in the root directory
- Use it as the source of truth for system architecture and internal behavior
- Ensure all changes align with the documented system understanding
- If a planned change conflicts with `understanding.md`:
  - Do NOT proceed silently
  - Clearly explain the conflict
  - Suggest a safe resolution before continuing

---

## Change Tracking (MANDATORY)
- After every meaningful code change, update the project log file

If no log file exists:
- Create one (e.g., `dev_log.md` or `CHANGELOG.md`)

Each log entry must include:
- What was changed
- Why the change was made
- Files/modules affected
- Any assumptions or side effects

Use a consistent format:

## [YYYY-MM-DD HH:MM]

### Changes
- Description of change

### Reason
- Why the change was needed

### Files Modified
- File paths

### Notes
- Additional context if needed

---

## ENCHANT Mode (Task Execution System)

### Definition
- "ENCHANT" is a custom project keyword
- It does NOT refer to any external tool, library, or shell command
- It must NOT be interpreted as spell checking, build tools, or system execution

---

### Trigger Behavior
When the user includes the keyword "ENCHANT":

- Immediately switch to task execution mode
- Do NOT ask what ENCHANT means
- Do NOT reinterpret the keyword

---

### Execution Behavior
- Read `instructions.md` from the root directory
- Treat it as the authoritative task list
- Begin executing tasks step-by-step

---

### Execution Rules
- Start from the first incomplete task
- Execute tasks strictly in order
- Do not skip tasks unless explicitly instructed
- Respect dependencies between tasks

After completing a task:
- Mark it as completed
- Update the task tracking file
- Prepare for the next task

---

### Continuation
- Maintain execution state across responses
- On follow-up prompts (e.g., "continue"), resume from the next incomplete task
- Never restart from the beginning unless explicitly instructed

---

### Failure Handling
- If a task cannot be completed:
  - Clearly explain the blocker
  - Suggest the next best action
  - Do not skip ahead silently

---

## Task Tracking (MANDATORY)
- Maintain a persistent record of completed tasks

If no tracking file exists:
- Create one (e.g., `task_progress.md`)

Each entry must include:
- Task name or description
- Status (Completed / Pending)
- Timestamp (recommended)

Rules:
- Always check this file before starting work
- Never repeat completed tasks
- Update it immediately after task completion

---

## Instruction File Awareness
- Always check for `instructions.md` in the root directory
- Use it as the single source of truth during ENCHANT mode
- If instructions are unclear or conflicting:
  - Do not guess
  - Ask for clarification or highlight the issue

---

## Development Discipline
- Break large changes into smaller, manageable steps
- Keep code modular and reusable
- Clearly separate concerns (API, business logic, data layer)

---

## Safety & Stability
- Do not overwrite working logic without clear justification
- Preserve backward compatibility unless explicitly instructed otherwise
- Add proper error handling for all critical operations

---

## Documentation
- Add comments for non-trivial logic
- Update README or relevant documentation when introducing changes

---

## Assumptions
- Make minimal, safe assumptions when requirements are unclear
- Document all assumptions in the log file