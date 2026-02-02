# Getting Started

## Installation

```bash
pnpm add @michael-nussbaumer/nuxt-directus
```

## Quick Setup

### 1. Add Module to `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
    modules: ["@michael-nussbaumer/nuxt-directus"],

    directus: {
        enableGlobalMiddleware: true,
        auth: {
            loginPath: "/auth/login",
            registerPath: "/auth/register",
            afterLoginPath: "/",
            afterLogoutPath: "/auth/login",
        },
        types: {
            enabled: false,
            openApiUrl: "http://directus.local/server/specs/oas",
            output: "./schema/schema.d.ts",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
});
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_OPENAPI_TOKEN=Bearer your-token-here
```

### 3. Directus Server Configuration

**Important:** Configure your Directus server to allow authentication-related URLs from your Nuxt app.

Add these environment variables to your **Directus server** `.env` file:

```env
# Allow password reset emails to link back to your Nuxt app
PASSWORD_RESET_URL_ALLOW_LIST=http://localhost:3000/auth/reset-password,https://your-app.com/auth/reset-password

# Allow user registration verification emails
USER_REGISTER_URL_ALLOW_LIST=http://localhost:3000/auth/verify-email,https://your-app.com/auth/verify-email

# Allow user invite emails (if using invites)
USER_INVITE_URL_ALLOW_LIST=http://localhost:3000/auth/accept-invite,https://your-app.com/auth/accept-invite
```

**Why is this needed?**

Directus requires you to explicitly allow URLs that can be used in authentication emails for security. Without these settings, password reset and email verification will fail.

**Production Setup:**

For production, only include your production URLs:

```env
PASSWORD_RESET_URL_ALLOW_LIST=https://your-app.com/auth/reset-password
USER_REGISTER_URL_ALLOW_LIST=https://your-app.com/auth/verify-email
USER_INVITE_URL_ALLOW_LIST=https://your-app.com/auth/accept-invite
```

**Multiple Environments:**

You can specify multiple URLs (comma-separated) to support both development and production:

```env
PASSWORD_RESET_URL_ALLOW_LIST=http://localhost:3000/auth/reset-password,https://staging.your-app.com/auth/reset-password,https://your-app.com/auth/reset-password
```

### 4. Proxy Configuration (Recommended)

If your Directus instance is on a different domain (e.g., `http://directus.example.com`), **use Nitro proxy** to avoid CORS issues and ensure cookies work properly:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    modules: ["@michael-nussbaumer/nuxt-directus"],

    routeRules: {
        // Proxy all Directus requests through your Nuxt server
        "/directus/**": {
            proxy: "http://directus.example.com/**",
        },
    },

    runtimeConfig: {
        public: {
            // Use the proxied path
            directusUrl: "/directus",
        },
    },
});
```

Then update your `.env`:

```env
# Use the proxied path
DIRECTUS_URL=/directus

# Or use environment-specific URLs
# DIRECTUS_URL=http://localhost:8055  # Development
# DIRECTUS_URL=/directus              # Production
```

**Benefits:**

- ✅ No CORS configuration needed
- ✅ Cookies work seamlessly (same origin)
- ✅ Secure httpOnly cookies supported
- ✅ WebSocket proxying automatic
- ✅ Simplified deployment

**Without Proxy (Direct Connection):**

If you connect directly to Directus on a different domain, you must configure:

1. **Directus CORS settings** (in `.env` on Directus server):

```env
CORS_ENABLED=true
CORS_ORIGIN=https://your-nuxt-app.com
CORS_CREDENTIALS=true
```

2. **Cookie settings** - Less secure:

```typescript
// Module uses httpOnly: false for cross-domain
// sameSite: 'none' required
// secure: true required in production
```

⚠️ **Direct connection is NOT recommended for production** due to security and complexity.

### 4. Basic Usage

```vue
<script setup lang="ts">
const { login, user, isAuthenticated } = useDirectusAuth();
const { getItems } = useDirectusApi();

// Login
const handleLogin = async () => {
    await login({
        email: "user@example.com",
        password: "password",
    });
};

// Fetch data
const posts = await getItems("posts", { limit: 10 });
</script>
```

## Architecture

The module uses a **hybrid architecture** combining:

- **Plugin**: Manages single Directus client instance, WebSocket, and global reactive state
- **Composables**: Provide clean, testable API for auth, CRUD operations, and realtime subscriptions

### Components

1. **Plugin** (`directus.ts`)
    - Single Directus client with cookie-based authentication
    - WebSocket connection management
    - Global reactive state (authentication, user, connection status)

2. **Composables**
    - `useDirectusAuth()` - Authentication methods
    - `useDirectusApi()` - REST API CRUD operations
    - `useDirectusRealtime()` - WebSocket subscriptions

3. **Middleware** (`directus-auth.ts`)
    - Global authentication middleware
    - Configurable behavior based on page meta
    - Automatic redirect handling

## Next Steps

- [Configuration](./configuration.md) - Detailed configuration options
- [Authentication](./authentication.md) - Auth methods and flows
- [API Usage](./api.md) - CRUD operations
- [Realtime](./realtime.md) - WebSocket subscriptions
- [Middleware](./middleware.md) - Route protection
- [Type Generation](./type-generation.md) - TypeScript types from OpenAPI
