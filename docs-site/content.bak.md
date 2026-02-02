---
layout: home

hero:
  name: "@michael-nussbaumer/nuxt-directus"
  text: "Directus SDK for Nuxt 4"
  tagline: Production-ready integration with authentication, middleware, and TypeScript type generation
  image:
    src: /logo.svg
    alt: Nuxt Directus
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Michael-Nussbaumer/nuxt-directus-module
    - theme: alt
      text: NPM Package
      link: https://www.npmjs.com/package/@michael-nussbaumer/nuxt-directus

features:
  - icon: 🔌
    title: Directus SDK Integration
    details: Seamless integration with @directus/sdk for all CRUD operations and custom requests
  
  - icon: 🔐
    title: Authentication Built-in
    details: Login, logout, register, password reset, email verification, and 2FA support out of the box
  
  - icon: 🛡️
    title: Global Auth Middleware
    details: Configurable route protection with flexible page meta options for public and protected routes
  
  - icon: 📘
    title: TypeScript Type Generation
    details: Auto-generate types from Directus OpenAPI schema for full type safety
  
  - icon: 👥
    title: Role-Based Permissions
    details: Optional role-based access control with custom field mapping and transform functions
  
  - icon: ⚡
    title: Realtime WebSocket
    details: Subscribe to live updates with automatic connection management and duplicate prevention
  
  - icon: ⚙️
    title: Flexible Configuration
    details: Extensive configuration options for auth paths, middleware behavior, and more
  
  - icon: 🚀
    title: Nuxt 4 Ready
    details: Built for Nuxt 4 with full compatibility for Nuxt 3 projects
---

## Quick Start

Install the module:

::: code-group
```bash [pnpm]
pnpm add @michael-nussbaumer/nuxt-directus
```

```bash [npm]
npm install @michael-nussbaumer/nuxt-directus
```

```bash [yarn]
yarn add @michael-nussbaumer/nuxt-directus
```
:::

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@michael-nussbaumer/nuxt-directus'],
  
  directus: {
    enableGlobalMiddleware: true,
    auth: {
      loginPath: '/auth/login',
      afterLoginPath: '/',
    },
  },
})
```

Set environment variables:

```env
DIRECTUS_URL=http://localhost:8055
```

Use in your components:

```vue
<script setup lang="ts">
const { login, user, isAuthenticated } = useDirectusAuth()
const { getItems } = useDirectusApi()

// Login
await login({ 
  email: 'user@example.com', 
  password: 'password' 
})

// Fetch data
const posts = await getItems('posts', { 
  limit: 10 
})
</script>
```

## Features Highlight

### Authentication

Complete authentication system with composable methods:

```typescript
const { 
  login, 
  logout, 
  register, 
  fetchUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  generateTwoFactorSecret,
  enableTwoFactor,
  disableTwoFactor
} = useDirectusAuth()
```

### Route Protection

Protect routes with simple page meta:

```typescript
// Protected page
definePageMeta({
  auth: true
})

// Public page
definePageMeta({
  auth: false
})

// Unauthenticated only (login page)
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard'
  }
})

// Role-based access
definePageMeta({
  auth: {
    roles: ['admin', 'editor'],
    unauthorizedRedirect: '/403'
  }
})
```

### API Operations

Full CRUD operations with TypeScript support:

```typescript
const { 
  getItems, 
  getItem, 
  createOne, 
  createMany,
  updateOne, 
  updateMany,
  deleteOne, 
  deleteMany 
} = useDirectusApi()

// With TypeScript
interface Post {
  id: string
  title: string
  content: string
}

const posts = await getItems<Post>('posts', {
  filter: { status: { _eq: 'published' } },
  sort: ['-date_created'],
  limit: 10
})
```

### Realtime Subscriptions

WebSocket subscriptions for live updates:

```typescript
const { subscribe, isConnected } = useDirectusRealtime()

subscribe(
  { 
    collection: 'posts',
    query: { 
      filter: { status: { _eq: 'published' } } 
    }
  },
  (data) => {
    console.log('Post updated:', data)
  }
)
```

## Why nuxt-directus?

- **Production Ready**: Battle-tested authentication and middleware system
- **Type Safe**: Full TypeScript support with automatic type generation
- **Developer Friendly**: Clean composables API, comprehensive documentation
- **Flexible**: Works with proxy or direct connection, configurable middleware behavior
- **Feature Complete**: Auth, CRUD, realtime, permissions, and more
- **Well Documented**: Extensive guides and examples for every feature
- **Active Maintenance**: Regular updates and bug fixes

## License

MIT License © 2026 Michael Nussbaumer
