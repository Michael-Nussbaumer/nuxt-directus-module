# Configuration

## Module Options

### Full Configuration Example

```typescript
export default defineNuxtConfig({
    directus: {
        // Global middleware behavior
        enableGlobalMiddleware: true,

        // Authentication paths
        auth: {
            loginPath: "/auth/login",
            registerPath: "/auth/register",
            afterLoginPath: "/",
            afterLogoutPath: "/auth/login",
        },

        // TypeScript type generation
        types: {
            enabled: false,
            openApiUrl: "http://directus.local/server/specs/oas",
            output: "./schema/schema.d.ts",
            redoclyConfig: "./redocly.yaml",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
});
```

## Options Reference

### `enableGlobalMiddleware`

- **Type:** `boolean`
- **Default:** `true`

Controls the default authentication behavior for all routes.

**When `true`:**

- All routes require authentication by default
- Use `auth: false` in page meta to make pages public
- Login/register paths are automatically excluded

**When `false`:**

- All routes are public by default
- Use `auth: true` in page meta to protect specific pages

```typescript
// Example: Secure by default
directus: {
    enableGlobalMiddleware: true;
}

// In pages:
definePageMeta({ auth: false }); // Make page public
```

### `auth.loginPath`

- **Type:** `string`
- **Default:** `'/login'`

Path to the login page. This route is automatically:

- Excluded from authentication checks
- Treated as unauthenticated-only (authenticated users redirected)
- Used as redirect target for unauthenticated users

```typescript
auth: {
    loginPath: "/auth/login";
}
```

### `auth.registerPath`

- **Type:** `string`
- **Default:** `'/register'`

Path to the registration page. Behavior is identical to `loginPath`.

```typescript
auth: {
    registerPath: "/auth/register";
}
```

### `auth.afterLoginPath`

- **Type:** `string`
- **Default:** `'/'`

Where to redirect users after successful login. Can be overridden by:

1. Stored redirect cookie (from protected page access attempt)
2. Page meta `navigateAuthenticatedTo` property

```typescript
auth: {
    afterLoginPath: "/dashboard";
}
```

### `auth.afterLogoutPath`

- **Type:** `string`
- **Default:** `'/login'`

Where to redirect users after logout.

```typescript
auth: {
    afterLogoutPath: "/goodbye";
}
```

## Type Generation Options

### `types.enabled`

- **Type:** `boolean`
- **Default:** `false`

Enable automatic TypeScript type generation from Directus OpenAPI schema.

```typescript
types: {
    enabled: true;
}
```

### `types.openApiUrl`

- **Type:** `string`
- **Default:** `undefined`
- **Required when:** `types.enabled === true`

URL to your Directus OpenAPI schema endpoint.

```typescript
types: {
    openApiUrl: "http://directus.local/server/specs/oas";
}
```

### `types.output`

- **Type:** `string`
- **Default:** `'./schema/schema.d.ts'`

Output path for generated TypeScript types.

```typescript
types: {
    output: "./types/directus-schema.d.ts";
}
```

### `types.redoclyConfig`

- **Type:** `string`
- **Default:** `undefined`
- **Optional**

Path to Redocly configuration file for advanced OpenAPI processing.

```typescript
types: {
    redoclyConfig: "./redocly.yaml";
}
```

### `types.authHeaderEnv`

- **Type:** `string`
- **Default:** `'DIRECTUS_OPENAPI_TOKEN'`

Environment variable name containing the authorization token for OpenAPI endpoint access.

```typescript
types: {
    authHeaderEnv: "MY_DIRECTUS_TOKEN";
}
```

Set in `.env`:

```env
MY_DIRECTUS_TOKEN=Bearer your-token-here
```

## Environment Variables

### Required

```env
DIRECTUS_URL=http://localhost:8055
```

The base URL of your Directus instance.

**For production with proxy:**

```env
DIRECTUS_URL=/directus
```

### Optional (for type generation)

```env
DIRECTUS_OPENAPI_TOKEN=Bearer your-admin-token-here
DIRECTUS_OPENAPI_URL=http://directus.local/server/specs/oas
```

## Proxy Configuration

### Why Use a Proxy?

When your Directus instance is on a different domain than your Nuxt app, use Nitro's proxy feature to:

- ✅ Avoid CORS configuration complexity
- ✅ Enable secure httpOnly cookies
- ✅ Simplify authentication flow
- ✅ Support WebSocket connections
- ✅ Reduce security risks

### Basic Proxy Setup

```typescript
export default defineNuxtConfig({
    modules: ["@michael-nussbaumer/nuxt-directus"],

    routeRules: {
        // Proxy all Directus requests
        "/directus/**": {
            proxy: "http://directus.example.com/**",
        },
    },

    runtimeConfig: {
        public: {
            directusUrl: "/directus",
        },
    },
});
```

```env
# .env
DIRECTUS_URL=/directus
```

### Environment-Specific Proxy

```typescript
export default defineNuxtConfig({
    routeRules: {
        "/directus/**": {
            proxy: process.env.NODE_ENV === "production" ? "https://directus.example.com/**" : "http://localhost:8055/**",
        },
    },

    runtimeConfig: {
        public: {
            directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || "/directus",
        },
    },
});
```

```env
# .env.development
DIRECTUS_URL=http://localhost:8055

# .env.production
DIRECTUS_URL=/directus
```

### Advanced Proxy with Headers

```typescript
export default defineNuxtConfig({
    routeRules: {
        "/directus/**": {
            proxy: {
                to: "http://directus.example.com/**",
                // Forward original host and protocol
                headers: {
                    "X-Forwarded-Host": (req) => req.headers.host,
                    "X-Forwarded-Proto": process.env.NODE_ENV === "production" ? "https" : "http",
                },
            },
        },
    },
});
```

### Direct Connection (Not Recommended)

If you cannot use a proxy, configure Directus CORS:

**On Directus server (`.env`):**

```env
CORS_ENABLED=true
CORS_ORIGIN=https://your-nuxt-app.com,http://localhost:3000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

**Security considerations:**

- httpOnly cookies cannot be used (less secure)
- sameSite must be 'none' (CSRF risk)
- Requires HTTPS in production
- More complex to maintain

⚠️ **Always prefer proxy configuration for production deployments.**

## Common Configurations

### Development Setup

```typescript
export default defineNuxtConfig({
    directus: {
        enableGlobalMiddleware: false, // Public by default for easier dev
        auth: {
            loginPath: "/auth/login",
            registerPath: "/auth/register",
            afterLoginPath: "/dashboard",
            afterLogoutPath: "/auth/login",
        },
        types: {
            enabled: true, // Generate types during development
            openApiUrl: "http://localhost:8055/server/specs/oas",
            output: "./schema/schema.d.ts",
        },
    },

    // Local Directus - no proxy needed
    runtimeConfig: {
        public: {
            directusUrl: "http://localhost:8055",
        },
    },
});
```

### Production Setup

```typescript
export default defineNuxtConfig({
    directus: {
        enableGlobalMiddleware: true, // Secure by default
        auth: {
            loginPath: "/auth/login",
            registerPath: "/auth/register",
            afterLoginPath: "/app",
            afterLogoutPath: "/",
        },
        types: {
            enabled: false, // Types already generated
        },
    },

    // Proxy Directus through Nuxt server
    routeRules: {
        "/directus/**": {
            proxy: "https://directus.example.com/**",
        },
    },

    runtimeConfig: {
        public: {
            directusUrl: "/directus",
        },
    },
});
```

```env
# .env.production
DIRECTUS_URL=/directus
```

### Multi-tenant Setup

```typescript
export default defineNuxtConfig({
    directus: {
        enableGlobalMiddleware: true,
        auth: {
            loginPath: "/tenant/login",
            registerPath: "/tenant/register",
            afterLoginPath: "/tenant/dashboard",
            afterLogoutPath: "/tenant/login",
        },
    },
});
```
