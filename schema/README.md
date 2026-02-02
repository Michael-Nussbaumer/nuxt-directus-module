# Directus Schema Types

This directory contains auto-generated TypeScript types from your Directus OpenAPI schema.

## Files

- `schema.d.ts` - Generated TypeScript type definitions (git-ignored by default)

## Generation

Types are automatically generated when you run:

```bash
pnpm run generate:types
```

Or during development:

```bash
pnpm run dev
```

## Configuration

Configure type generation in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    directus: {
        types: {
            enabled: true,
            openApiUrl: "http://directus.local/server/specs/oas",
            output: "./schema/schema.d.ts",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
});
```

## Environment Variables

Set the following in your `.env` file:

```env
DIRECTUS_OPENAPI_TOKEN=Bearer your-token-here
DIRECTUS_OPENAPI_URL=http://directus.local/server/specs/oas
```

## Usage

Import types in your Nuxt app:

```typescript
import type { components } from "#directus-types";

type User = components["schemas"]["Users"];
```
