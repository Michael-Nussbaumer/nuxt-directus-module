# Authentication

The `useDirectusAuth()` composable provides authentication methods and reactive state.

::callout{icon="i-lucide-info" color="blue"}
For password reset and email verification to work, you must configure URL allow lists on your Directus server. See [Configuration → Directus Server Configuration](/configuration#directus-server-configuration) for details.
::

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
- `credentials.otp` (string, optional) - One-time password for 2FA

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

**Returns:** `Promise<boolean>`

**Features:**

- Sends verification email to user
- User must verify email before logging in
- Verification URL can be configured via `auth.verificationUrl`

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

::callout{icon="i-lucide-alert-triangle" color="amber"}
Requires `USER_REGISTER_URL_ALLOW_LIST` configured on your Directus server. See [Configuration](/configuration#directus-server-configuration).
::

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

::callout{icon="i-lucide-alert-triangle" color="amber"}
Requires `PASSWORD_RESET_URL_ALLOW_LIST` configured on your Directus server. See [Configuration](/configuration#directus-server-configuration).
::

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

### `updatePassword(currentPassword, newPassword)`

Update the current user's password.

**Parameters:**

- `currentPassword` (string) - Current password for verification
- `newPassword` (string) - New password

**Returns:** `Promise<boolean>`

```vue
<script setup lang="ts">
const { updatePassword } = useDirectusAuth();

const currentPassword = ref("");
const newPassword = ref("");

const handlePasswordUpdate = async () => {
    try {
        await updatePassword(currentPassword.value, newPassword.value);
        // Password updated successfully
    } catch (e) {
        console.error("Password update failed:", e);
    }
};
</script>
```

### `generateTwoFactorSecret(password)`

Generate a 2FA secret for the current user.

**Parameters:**

- `password` (string) - Current password for verification

**Returns:** `Promise<{ secret: string; otpauth_url: string }>`

```typescript
const { generateTwoFactorSecret } = useDirectusAuth();

const setup2FA = async () => {
    const { secret, otpauth_url } = await generateTwoFactorSecret(password.value);
    // Display QR code using otpauth_url
};
```

### `enableTwoFactor(secret, otp)`

Enable 2FA for the current user.

**Parameters:**

- `secret` (string) - Secret from `generateTwoFactorSecret`
- `otp` (string) - One-time password from authenticator app

**Returns:** `Promise<boolean>`

```typescript
const { enableTwoFactor } = useDirectusAuth();

await enableTwoFactor(secret, otpCode.value);
// 2FA is now enabled
```

### `disableTwoFactor(otp)`

Disable 2FA for the current user.

**Parameters:**

- `otp` (string) - One-time password from authenticator app

**Returns:** `Promise<boolean>`

```typescript
const { disableTwoFactor } = useDirectusAuth();

await disableTwoFactor(otpCode.value);
// 2FA is now disabled
```

### `isTwoFactorEnabled`

- **Type:** `ComputedRef<boolean>`
- **Readonly**

Whether the current user has 2FA enabled.

```typescript
const { isTwoFactorEnabled } = useDirectusAuth();

if (isTwoFactorEnabled.value) {
    // Show 2FA management UI
}
```

### `userRoles`

- **Type:** `ComputedRef<string[]>`
- **Readonly**

Array of user roles (with mapping and transformation applied). Requires permissions configuration enabled.

```typescript
const { userRoles } = useDirectusAuth();

console.log(userRoles.value); // ['admin', 'editor']
```

### `userRole`

- **Type:** `ComputedRef<string | null>`
- **Readonly**

Primary user role (first role in array). Convenience accessor for single-role scenarios.

```typescript
const { userRole } = useDirectusAuth();

console.log(userRole.value); // 'admin'
```

### `userRoleRaw`

- **Type:** `ComputedRef<any>`
- **Readonly**

Raw role value from Directus (untransformed, unmapped).

```typescript
const { userRoleRaw } = useDirectusAuth();

console.log(userRoleRaw.value); // UUID or raw field value
```

### `hasRole(role)`

Check if user has a specific role.

**Parameters:**

- `role` (string) - Role to check

**Returns:** `boolean`

```typescript
const { hasRole } = useDirectusAuth();

if (hasRole('admin')) {
    // Show admin features
}
```

### `hasAnyRole(roles)`

Check if user has any of the specified roles.

**Parameters:**

- `roles` (string[]) - Array of roles to check

**Returns:** `boolean`

```typescript
const { hasAnyRole } = useDirectusAuth();

if (hasAnyRole(['admin', 'moderator'])) {
    // Show moderation features
}
```

### `hasAllRoles(roles)`

Check if user has all of the specified roles.

**Parameters:**

- `roles` (string[]) - Array of roles to check

**Returns:** `boolean`

```typescript
const { hasAllRoles } = useDirectusAuth();

if (hasAllRoles(['premium', 'verified'])) {
    // Show premium verified features
}
```

### `isNotRole(roles)`

Check if user is NOT in any of the excluded roles.

**Parameters:**

- `roles` (string[]) - Array of roles to exclude

**Returns:** `boolean`

```typescript
const { isNotRole } = useDirectusAuth();

if (isNotRole(['banned', 'suspended'])) {
    // Allow access
}
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
