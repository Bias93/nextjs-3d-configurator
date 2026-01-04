---
trigger: always_on
---

## Tech Stack
- Framework: Next.js 16 App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS 4
- UI: shadcn/ui components

## Code Style
- Use functional components with hooks, never class components
- Props must have TypeScript interface defined above component
- Use named exports, not default exports
- File naming: kebab-case for files, PascalCase for components
- Prefer `const` over `let`, never `var`
- Use async/await over .then() chains

## Project Structure
- Components: src/components/
- Hooks: src/hooks/
- Types: src/types/
- API routes: src/app/api/

## Imports
- Use @/ alias for imports from src directory
- Group imports: external → internal → relative → styles

## Specific Conventions
- Mobile-first responsive design
- Use existing CSS variables when available
- Keep components under 200 lines, split if larger