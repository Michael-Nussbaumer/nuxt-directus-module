# Authentication

The `useDirectusAuth()` composable provides authentication methods and reactive state.

## Usage

```vue
<script setup lang="ts">
const { user, isAuthenticated, isLoading, error, login, logout, register, fetchUser, verifyEmail, requestPasswordReset, resetPassword, refreshToken } = useDirectusAuth();
</script>
```

## State

### `user`

- **Type:** `ComputedRef<DirectusUser | null>`
- **Readonly**

Current authenticated user object. Automatically updated by the plugin's global state.

```typescript
const { user } = useDirectusAuth();

console.log(user.value?.email);
console.log(user.value?.first_name);
console.log(user.value?.role);
```

### `isAuthenticated`

- **Type:** `ComputedRef<boolean>`
- **Readonly**

Whether the user is currently authenticated.

```typescript
const { isAuthenticated } = useDirectusAuth();

if (isAuthenticated.value) {
    // User is logged in
}
```

### `isLoading`

- **Type:** `Ref<boolean>`

Loading state for async operations.

```typescript
const { isLoading, login } = useDirectusAuth()

<button :disabled="isLoading">
  {{ isLoading ? 'Loading...' : 'Login' }}
</button>
```

### `error`

- **Type:** `Ref<string | null>`

Error message from the last failed operation.

```typescript
const { error, login } = useDirectusAuth()

<div v-if="error" class="error">
  {{ error }}
</div>
```

## Methods

### `login(credentials)`

Authenticate a user with email and password.

**Parameters:**

- `credentials.email` (string) - User email
- `credentials.password` (string) - User password

**Returns:** `Promise<DirectusUser>`

**Features:**

- Automatically fetches user data after login
- Initializes WebSocket connection
- Handles redirect cookie (returns to intended page)
- Falls back to `afterLoginPath` if no redirect stored

```vue
<script setup lang="ts">
const { login, error } = useDirectusAuth();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
    try {
        await login({
            email: email.value,
            password: password.value,
        });
        // User is now logged in and redirected
    } catch (e) {
        console.error("Login failed:", e);
    }
};
</script>

<template>
    <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" />
        <input v-model="password" type="password" />
        <button type="submit">Login</button>
        <p v-if="error">{{ error }}</p>
    </form>
</template>
```

### `logout()`

Log out the current user.

**Returns:** `Promise<void>`

**Features:**

- Clears authentication cookies
- Updates global state
- Redirects to `afterLogoutPath`
- Handles cleanup even if server logout fails

```typescript
const { logout } = useDirectusAuth();

const handleLogout = async () => {
    await logout();
};
```

### `register(data)`

Register a new user account.

**Parameters:**

- `data.email` (string) - User email
- `data.password` (string) - User password
- `data.first_name` (string, optional) - First name
- `data.last_name` (string, optional) - Last name
- Additional custom fields

**Returns:** `Promise<DirectusUser>`

**Features:**

- Automatically logs in after successful registration
- Redirects to `afterLoginPath`

```vue
<script setup lang="ts">
const { register } = useDirectusAuth();

const formData = ref({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
});

const handleRegister = async () => {
    await register(formData.value);
};
</script>
```

### `fetchUser()`

Fetch current user data and update authentication state.

**Returns:** `Promise<DirectusUser | null>`

Useful for:

- Refreshing user data
- Checking authentication status
- Updating profile after changes

```typescript
const { fetchUser } = useDirectusAuth();

// Refresh user data
await fetchUser();
```

### `verifyEmail(token)`

Verify user email address with a verification token.

**Parameters:**

- `token` (string) - Email verification token from email

**Returns:** `Promise<boolean>`

```typescript
const { verifyEmail } = useDirectusAuth();
const route = useRoute();

onMounted(async () => {
    const token = route.query.token as string;
    if (token) {
        await verifyEmail(token);
    }
});
```

### `requestPasswordReset(email)`

Request a password reset email.

**Parameters:**

- `email` (string) - User email address

**Returns:** `Promise<boolean>`

```vue
<script setup lang="ts">
const { requestPasswordReset } = useDirectusAuth();

const email = ref("");

const handleReset = async () => {
    await requestPasswordReset(email.value);
    // User receives reset email
};
</script>
```

### `resetPassword(token, password)`

Reset password using a reset token.

**Parameters:**

- `token` (string) - Password reset token from email
- `password` (string) - New password

**Returns:** `Promise<boolean>`

```vue
<script setup lang="ts">
const { resetPassword } = useDirectusAuth();
const route = useRoute();

const newPassword = ref("");

const handleReset = async () => {
    const token = route.query.token as string;
    await resetPassword(token, newPassword.value);
    // Password updated, user can now login
};
</script>
```

### `refreshToken()`

Refresh the authentication token.

**Returns:** `Promise<boolean>`

Useful for:

- Extending session lifetime
- Recovering from expired tokens

```typescript
const { refreshToken } = useDirectusAuth();

// Refresh token every 10 minutes
setInterval(
    async () => {
        try {
            await refreshToken();
        } catch (e) {
            console.error("Token refresh failed");
        }
    },
    10 * 60 * 1000,
);
```

## Complete Login Example

```vue
<template>
    <div class="login-page">
        <form @submit.prevent="handleLogin">
            <h1>Login</h1>

            <div>
                <label>Email</label>
                <input v-model="credentials.email" type="email" required />
            </div>

            <div>
                <label>Password</label>
                <input v-model="credentials.password" type="password" required />
            </div>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? "Logging in..." : "Login" }}
            </button>

            <div v-if="error" class="error">
                {{ error }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/dashboard",
    },
});

const { login, isLoading, error } = useDirectusAuth();

const credentials = ref({
    email: "",
    password: "",
});

const handleLogin = async () => {
    await login(credentials.value);
};
</script>
```

## Complete Register Example

```vue
<template>
    <div class="register-page">
        <form @submit.prevent="handleRegister">
            <h1>Register</h1>

            <div>
                <label>First Name</label>
                <input v-model="formData.first_name" />
            </div>

            <div>
                <label>Last Name</label>
                <input v-model="formData.last_name" />
            </div>

            <div>
                <label>Email</label>
                <input v-model="formData.email" type="email" required />
            </div>

            <div>
                <label>Password</label>
                <input v-model="formData.password" type="password" required />
            </div>

            <button type="submit" :disabled="isLoading">
                {{ isLoading ? "Creating account..." : "Register" }}
            </button>

            <div v-if="error" class="error">
                {{ error }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
    },
});

const { register, isLoading, error } = useDirectusAuth();

const formData = ref({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
});

const handleRegister = async () => {
    await register(formData.value);
};
</script>
```

## TypeScript Types

```typescript
interface DirectusUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: any;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
}
```
