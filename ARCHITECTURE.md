# Frontend Architecture

This frontend uses a Clean Architecture-inspired structure with explicit layers for view, repositories, adapters, and application policies. The use-case layer has been collapsed into hooks for simplicity.

## Layer Overview

1. View Layer

- Location: `src/routes`, `src/components`
- Responsibility: render UI and collect user input.
- Rule: no direct HTTP calls and no storage/network details.

2. Hook Layer (TanStack Query Bindings)

- Location: `src/hooks`
- Responsibility: manage data fetching and mutations via TanStack Query; call repositories directly.
- Rule: depend on repository contracts, delegate query keys and invalidation to application layer.

3. Repository Layer (Contracts)

- Location: `src/repositories`
- Responsibility: define stable interfaces for data access.
- Rule: no framework/transport specifics in contracts.

4. Adapter Layer (Implementations)

- Location: `src/adapters/http`
- Responsibility: implement repository contracts using HTTP + DTO serialization.
- Rule: infrastructure details live here.

5. Application Composition + Policies

- Location: `src/application`
- Responsibility: wire adapters into repositories, centralize query keys/invalidation, normalize errors.

6. Service Layer (Infrastructure Utility)

- Location: `src/services`
- Responsibility: low-level transport utility (`api-client.ts`) that normalizes errors at the network boundary.

## Directory Map

```text
src/
├── routes/                        # View layer pages (TanStack file routes)
├── components/                    # Reusable UI pieces
├── hooks/                         # TanStack Query bindings (call repositories directly)
├── repositories/                  # Repository interfaces (contracts)
├── adapters/http/                 # Concrete repository implementations
├── application/
│   ├── dependencies.ts            # Repository-to-HTTP-adapter wiring
│   ├── query-keys.ts              # Central query key definitions
│   ├── query-policies.ts          # Central query invalidation policies
│   ├── errors.ts                  # AppError model + transport error mapping
│   └── form-error-mapper.ts       # UI form error projection
├── services/
│   └── api-client.ts              # HTTP client + error normalization
├── features/                      # Feature-specific schemas/form models
└── types/                         # Shared DTOs and primitives
```

## Runtime Flow

```text
User action
  -> Route/Component (View)
  -> Hook (TanStack Query binding)
  -> Repository contract call
  -> HTTP adapter implementation
  -> apiClient
  -> Backend API
```

## Error Handling Flow

```text
HTTP error response
  -> api-client throws { name, message, status, payload }
  -> toAppError() in application/errors.ts normalizes to AppError
  -> mapToFormErrors() in application/form-error-mapper.ts projects to UI
  -> Route sets form + field errors
```

This keeps transport-specific error shapes out of routes and form components, and centralizes error mapping logic.

## What Hooks Do Now

Hooks in `src/hooks` are thin TanStack Query wrappers:

- Call repository methods directly from `src/application/dependencies.ts` (e.g., `repositories.brands.search(params)`)
- Use query keys from `src/application/query-keys.ts`
- Delegate invalidation to `src/application/query-policies.ts` on mutation success

This prevents query key drift, duplicated invalidation logic, and removes the need for an intermediate use-case layer.

## Concrete Example (Brand Create)

1. Route: `src/routes/brands/create.tsx`

- uses React Hook Form + Zod for client validation
- submits with `useCreateBrand` hook
- catches errors and maps via `mapToFormErrors`

2. Hook: `src/hooks/useBrands.ts`

- calls `repositories.brands.create(data)` in mutation function
- delegates invalidation to `queryPolicies.brands.afterCreate`

3. Adapter: `src/adapters/http/brands-http.repository.ts`

- implements `BrandRepository` interface
- performs HTTP calls via `apiClient`

4. API Client: `src/services/api-client.ts`

- catches HTTP errors, normalizes to duck-typed transport error shape `{ name, message, status, payload }`
- higher layers call `toAppError()` to convert to application error type

## Design Rules

- Routes/components must not import adapters or api client directly.
- Hooks must not import concrete adapter files.
- Adapters implement repository contracts and nothing UI-specific.
- Query keys and invalidation rules are centralized in `src/application`.
- Errors are normalized at the transport boundary (api-client) and mapped to application shape (AppError) before reaching UI.

## Dependency Rules (Allowed Imports)

Use this as a quick review matrix.

1. `src/routes`, `src/components` (View)

- Allowed: `src/hooks`, `src/features`, `src/types`, UI libraries.
- Forbidden: `src/adapters`, `src/repositories`, `src/services/api-client`.

2. `src/hooks` (TanStack Query binding)

- Allowed: `src/application/dependencies`, `src/application/query-keys`, `src/application/query-policies`, `src/application/form-error-mapper`, `src/types`, TanStack Query.
- Forbidden: `src/adapters`, `src/services/api-client`.

3. `src/repositories` (Contracts)

- Allowed: `src/types`.
- Forbidden: `src/adapters`, `src/services`, React/TanStack imports.

4. `src/adapters/http` (Adapter implementations)

- Allowed: `src/repositories` contracts, `src/services/api-client`, `src/types`, adapter helpers.
- Forbidden: `src/routes`, `src/components`, `src/hooks`.

5. `src/application` (Composition and policy)

- Allowed: `src/repositories`, `src/adapters/http`, `src/types`.
- Forbidden: direct imports from `src/routes` or `src/components`.

6. `src/services/api-client.ts` (Transport utility)

- Allowed: platform/network concerns only.
- Forbidden: feature-specific UI logic, application error types.

### Example Imports

Allowed:

```ts
// hook -> dependencies (repositories)
import { repositories } from "#/application/dependencies";

// hook -> query keys
import { queryKeys } from "#/application/query-keys";

// adapter -> api client
import { apiClient } from "#/services/api-client";

// route -> hook
import { useCreateBrand } from "#/hooks/useBrands";

// route -> error mapper
import { mapToFormErrors } from "#/application/form-error-mapper";
```

Forbidden:

```ts
// view -> adapter
import { brandsHttpRepository } from "#/adapters/http/brands-http.repository";

// hook -> raw transport
import { apiClient } from "#/services/api-client";

// route -> repository contract
import type { BrandRepository } from "#/repositories";
```

## Adding a New Feature (Checklist)

1. Add/extend DTO types in `src/types`.
2. Add repository contract in `src/repositories`.
3. Add adapter implementation in `src/adapters/http`.
4. Wire adapter in `src/application/dependencies.ts`.
5. Add query keys in `src/application/query-keys.ts`.
6. Add invalidation policies in `src/application/query-policies.ts`.
7. Add hooks in `src/hooks` that call `repositories.*` directly.
8. Build route/component UI in `src/routes`/`src/components`.

## Environment Variables

Set API base URL in `.env.local`:

```text
VITE_API_URL=http://localhost:5071/api
```

## Current Status

- View, Repository, and Adapter layers are explicitly implemented.
- Hooks are thin TanStack Query bindings that call repositories directly (no use-case layer).
- Query keys and invalidation policies are centralized in `src/application`.
- Error mapping is centralized: transport errors → AppError → form errors.
- Legacy use-case files have been removed.
