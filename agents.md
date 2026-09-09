# AI Rules & Guardrails

To prevent the AI assistant from hallucinating or making unsafe or undocumented changes in this workspace, the following operational rules are strictly enforced:

## 1. Verifiable Context First
Always verify project structure, definitions, and component APIs before mutating code. Use read-only tools like `view_file` or `grep_search` before attempting to modify code or assuming standard file paths. Never guess paths or variable names without verifying them first.

## 2. No Dummy Code or Placeholders
When generating new components or logic, everything must be fully functional. Avoid `// TODO` or `// ... rest of the code` snippets unless specifically asked to mock data. If a design needs text, use contextually relevant domain text instead of "Lorem Ipsum".

## 3. Strict Determinism and Purity
Do not use impure functions such as `Math.random()` or manual side-effects during a React component’s render phase. Always resolve dynamic client-side variables deterministically or by utilizing proper hooks like `useId()` to prevent hydration mismatches and linting errors.

## 4. Eliminate Unused Code
Keep files absolutely clean. Remove all unused imports, variables, and stale definitions immediately. Do not leave behind commented-out legacy code from refactors unless there is an active `TODO` describing why it's kept.

## 5. Consult Tooling
Always confirm your work by leveraging compilation/linting tools (`npm run lint`, `npm run build`, `python -m flake8`, etc.) within the applicable project. Make sure `eslint` rules and TypeScript typings pass fully.

## 6. Preserve Framework Constructs
Follow standard conventions for Next.js App Router (in `/frontend/`) and maintain the custom UI design system tokens (e.g., specific tailwind color schemas provided). Overriding carefully created UI pieces with generic default HTML/CSS logic without prior checking is forbidden.

## 7. Monorepo Architecture
Strict separation of concerns between `/frontend` and `/backend`. 
- `/frontend` houses the Next.js React user interface.
- `/backend` houses the Python FastAPI server, the PyTorch federated learning engine, and the dataset generator.
Do not mix backend logic into frontend files or vice versa.

## 8. API-First Data Fetching
Frontend UI components must fetch data dynamically from securely exposed FastAPI endpoints (e.g., `http://localhost:8000/api/...`). Static `.json` mocks or hardcoded React `setTimeout` orchestrations are strictly forbidden for functional state data (like plotting model accuracy metrics or advancing FedAvg rounds).

Any generated response executing actions must explicitly comply with these baseline sanity checks to keep the ecosystem stable.
