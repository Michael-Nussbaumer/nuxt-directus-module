# Role-Based Permissions

The Directus module now supports optional role-based access control for pages and components.

## Features

- ✅ Optional and backward compatible (disabled by default)
- ✅ Configurable field name (not limited to `role`)
- ✅ Support for role mapping (UUID to readable names)
- ✅ Custom transform functions for complex scenarios
- ✅ Page-level restrictions via `definePageMeta`
- ✅ Component-level checks via composable helpers

## Configuration

### Basic Setup

Enable role-based permissions in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "role", // default: 'role'
            },
        },
    },
});
```

### With Role Mapping

Map Directus role UUIDs to readable names:

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "role",
                mapping: {
                    "a1b2c3d4-uuid-here": "admin",
                    "e5f6g7h8-uuid-here": "editor",
                    "i9j0k1l2-uuid-here": "user",
                },
            },
        },
    },
});
```

### With Custom Field

Use any Directus user field for permission checking:

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "subscription_tier", // Custom field
                mapping: {
                    basic: "basic",
                    premium: "premium",
                    enterprise: "enterprise",
                },
            },
        },
    },
});
```

### With Transform Function (Single Role)

For complex field types (JSON, objects, computed values):

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "custom_permissions",
                transform: (value, user) => {
                    // Parse JSON field
                    if (typeof value === "string") {
                        try {
                            const parsed = JSON.parse(value);
                            return parsed.level || "user";
                        } catch {
                            return "user";
                        }
                    }
                    // Handle object field
                    return value?.level || "user";
                },
                mapping: {
                    "1": "basic",
                    "2": "advanced",
                    "3": "admin",
                },
            },
        },
    },
});
```

### With Transform Function (Multiple Roles)

Transform can return an array to give users multiple roles:

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "permissions", // Could be a JSON field or comma-separated string
                transform: (value, user) => {
                    // Parse comma-separated string
                    if (typeof value === "string" && value.includes(",")) {
                        return value.split(",").map((r) => r.trim());
                    }

                    // Parse JSON array
                    if (typeof value === "string") {
                        try {
                            const parsed = JSON.parse(value);
                            return Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                            return [value];
                        }
                    }

                    // Already an array
                    if (Array.isArray(value)) {
                        return value;
                    }

                    // Single value
                    return value ? [value] : [];
                },
                mapping: {
                    "role-uuid-1": "admin",
                    "role-uuid-2": "editor",
                    "role-uuid-3": "moderator",
                },
            },
        },
    },
});
```

### Combine Multiple Fields into Roles

```typescript
export default defineNuxtConfig({
    directus: {
        auth: {
            permissions: {
                enabled: true,
                field: "role", // Primary field
                transform: (value, user) => {
                    const roles = [value]; // Start with primary role

                    // Add roles based on other fields
                    if (user.is_admin) roles.push("admin");
                    if (user.is_moderator) roles.push("moderator");
                    if (user.subscription_active) roles.push("premium");

                    return roles.filter(Boolean); // Remove nulls/undefined
                },
            },
        },
    },
});
```

## Page-Level Restrictions

### Require Specific Roles

Only users with one of the specified roles can access:

```vue
<script setup>
definePageMeta({
    auth: {
        roles: ["admin", "editor"], // User must be admin OR editor
    },
});
</script>
```

### Exclude Specific Roles

Prevent certain roles from accessing:

```vue
<script setup>
definePageMeta({
    auth: {
        excludeRoles: ["banned", "suspended"],
    },
});
</script>
```

### Custom Unauthorized Redirect

```vue
<script setup>
definePageMeta({
    auth: {
        roles: ["premium", "enterprise"],
        unauthorizedRedirect: "/upgrade", // Redirect non-premium users here
    },
});
</script>
```

### Combined with Authentication

```vue
<script setup>
definePageMeta({
    auth: {
        // Regular auth options still work
        navigateUnauthenticatedTo: "/auth/login",

        // Plus role restrictions
        roles: ["admin"],
        unauthorizedRedirect: "/dashboard",
    },
});
</script>
```

## Component-Level Checks

Use the composable helpers for conditional rendering:

```vue
<template>
    <div>
        <!-- Show all roles -->
        <p>Your roles: {{ userRoles.join(", ") }}</p>

        <!-- Show primary role -->
        <p>Primary role: {{ userRole }}</p>

        <!-- Check specific role -->
        <UButton v-if="hasRole('admin')"> Admin Panel </UButton>

        <!-- Check multiple roles (user needs at least one) -->
        <UButton v-if="hasAnyRole(['admin', 'moderator'])"> Moderate Content </UButton>

        <!-- Check if user has ALL specified roles -->
        <UButton v-if="hasAllRoles(['premium', 'verified'])"> Premium Verified Features </UButton>

        <!-- Conditional features -->
        <div v-if="hasAnyRole(['premium', 'enterprise'])">
            <h2>Premium Features</h2>
            <!-- Premium content -->
        </div>

        <!-- Exclude roles -->
        <div v-if="isNotRole(['banned', 'suspended'])">
            <!-- Available to non-banned users -->
        </div>

        <!-- Get raw role value -->
        <p v-if="userRoleRaw">Raw role value: {{ userRoleRaw }}</p>
    </div>
</template>

<script setup>
const {
    userRoles, // Array of all roles (mapped)
    userRole, // Primary role (first in array)
    userRoleRaw, // Raw role value from Directus
    hasRole, // Check if user has specific role
    hasAnyRole, // Check if user has any of the roles
    hasAllRoles, // Check if user has all specified roles
    isNotRole, // Check if user is NOT in excluded roles
} = useDirectusAuth();
</script>
```

## Use Cases

### 1. Subscription Tiers

```typescript
// nuxt.config.ts
directus: {
  auth: {
    permissions: {
      enabled: true,
      field: 'subscription_tier',
      mapping: {
        'free': 'free',
        'pro': 'pro',
        'enterprise': 'enterprise'
      }
    }
  }
}
```

```vue
<!-- pages/premium-features.vue -->
<script setup>
definePageMeta({
    auth: {
        roles: ["pro", "enterprise"],
        unauthorizedRedirect: "/pricing",
    },
});
</script>
```

### 2. Department-Based Access

```typescript
// nuxt.config.ts
directus: {
  auth: {
    permissions: {
      enabled: true,
      field: 'department',
      mapping: {
        'dept-uuid-1': 'engineering',
        'dept-uuid-2': 'marketing',
        'dept-uuid-3': 'sales'
      }
    }
  }
}
```

```vue
<!-- pages/engineering/index.vue -->
<script setup>
definePageMeta({
    auth: {
        roles: ["engineering"],
    },
});
</script>
```

### 3. Multi-Factor Computed Roles

```typescript
// nuxt.config.ts
directus: {
  auth: {
    permissions: {
      enabled: true,
      field: 'role',
      transform: (roleValue, user) => {
        const roles = []

        // Add primary role
        if (roleValue) roles.push(roleValue)

        // Add conditional roles
        if (user.email_verified === false) roles.push('unverified')
        if (user.subscription_active) roles.push('premium')
        if (user.is_beta_tester) roles.push('beta')

        return roles
      },
      mapping: {
        'uuid-admin': 'admin',
        'uuid-user': 'user'
      }
    }
  }
}
```

### 4. Parse Comma-Separated String

```typescript
// If Directus field contains: "admin,editor,moderator"
directus: {
  auth: {
    permissions: {
      enabled: true,
      field: 'roles_string',
      transform: (value) => {
        if (typeof value === 'string') {
          return value.split(',').map(r => r.trim()).filter(Boolean)
        }
        return []
      }
    }
  }
}
```

### 5. Parse JSON Field

```typescript
// If Directus field contains: {"roles": ["admin", "editor"], "level": 5}
directus: {
  auth: {
    permissions: {
      enabled: true,
      field: 'permissions_json',
      transform: (value) => {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            return parsed.roles || []
          } catch {
            return []
          }
        }
        return value?.roles || []
      }
    }
  }
}
```

## Backward Compatibility

Without any configuration, the system works as before:

- `permissions.enabled: false` (default) - No role checking
- No `roles` in page meta - Authenticated users can access
- No role mapping - Uses raw values from Directus

## API Reference

### Composable: `useDirectusAuth()`

**Returns:**

- `userRoles: ComputedRef<string[]>` - Array of all mapped roles
- `userRole: ComputedRef<string | null>` - Primary role (first in array)
- `userRoleRaw: ComputedRef<any>` - Raw field value from Directus
- `hasRole(role: string): boolean` - Check if user has specific role
- `hasAnyRole(roles: string[]): boolean` - Check if user has any of the roles (OR)
- `hasAllRoles(roles: string[]): boolean` - Check if user has all specified roles (AND)
- `isNotRole(roles: string[]): boolean` - Check user doesn't have any of these roles

### Page Meta: `definePageMeta({ auth: {...} })`

**New Options:**

- `roles?: string[]` - Required roles (user needs at least ONE)
- `excludeRoles?: string[]` - Forbidden roles (user must NOT have any)
- `unauthorizedRedirect?: string` - Where to redirect unauthorized users

### Module Config: `directus.auth.permissions`

**Options:**

- `enabled: boolean` - Enable role checking (default: false)
- `field: string` - User field to check (default: 'role')
- `mapping?: Record<string, string>` - Map field values to names
- `transform?: (value: any, user: any) => string | string[]` - Transform field value (can return array for multiple roles)

## Migration Guide

### From No Permissions to Basic Roles

1. Enable permissions:

```typescript
directus: {
    auth: {
        permissions: {
            enabled: true;
        }
    }
}
```

2. Add role restrictions to specific pages:

```vue
definePageMeta({ auth: { roles: ['admin'] } })
```

### From Raw UUIDs to Readable Names

Add mapping to your config:

```typescript
mapping: {
  'actual-uuid-from-directus': 'admin',
  'another-uuid-from-directus': 'user'
}
```

Pages can now use readable names:

```vue
definePageMeta({ auth: { roles: ['admin'] } })
```
