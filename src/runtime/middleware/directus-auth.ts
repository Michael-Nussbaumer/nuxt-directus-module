import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig, useCookie } from "#app";
import { useDirectusAuth } from "../composables/useDirectusAuth";

export interface PageMetaAuth {
    /**
     * If true, requires authentication
     * If false, page is public
     * If object, provides advanced configuration
     */
    auth?:
        | boolean
        | {
              /**
               * If true, only unauthenticated users can access
               */
              unauthenticatedOnly?: boolean;
              /**
               * Where to redirect authenticated users (when unauthenticatedOnly is true)
               */
              navigateAuthenticatedTo?: string;
              /**
               * Where to redirect unauthenticated users
               */
              navigateUnauthenticatedTo?: string;
              /**
               * Roles that can access this page
               * User needs ONE of these roles (OR logic with user's roles)
               */
              roles?: string[];
              /**
               * Roles that CANNOT access this page
               */
              excludeRoles?: string[];
              /**
               * Where to redirect if user doesn't have required role
               */
              unauthorizedRedirect?: string;
          };
}

declare module "#app" {
    interface PageMeta extends PageMetaAuth {}
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isAuthenticated } = useDirectusAuth();
    const config = useRuntimeConfig();
    const { $directusAuth } = useNuxtApp();

    const { loginPath, registerPath, afterLoginPath } = config.public.directus?.auth || {
        loginPath: "/login",
        registerPath: "/register",
        afterLoginPath: "/",
    };

    const enableGlobalMiddleware = config.public.directus?.enableGlobalMiddleware ?? true;

    if (import.meta.dev) {
        console.log("[directus-auth middleware] from", from.fullPath, "to", to.fullPath);
    }

    // Handle different auth meta formats
    const authMetaRaw = to.meta?.auth;
    let authMeta: { unauthenticatedOnly?: boolean; navigateAuthenticatedTo?: string; navigateUnauthenticatedTo?: string } | undefined;
    let requiresAuth: boolean;

    if (authMetaRaw === false) {
        // auth: false - page is public, no authentication required
        requiresAuth = false;
    } else if (authMetaRaw === true) {
        // auth: true - page requires authentication
        requiresAuth = true;
        authMeta = {};
    } else if (typeof authMetaRaw === "object" && authMetaRaw !== null) {
        // auth: { ... } - custom auth configuration, requires auth
        requiresAuth = true;
        authMeta = authMetaRaw;
    } else {
        // auth is undefined - use global middleware setting as default
        // If enableGlobalMiddleware: true -> require auth by default
        // If enableGlobalMiddleware: false -> public by default
        requiresAuth = enableGlobalMiddleware;
    }

    // Skip middleware for login/register pages
    if ([loginPath, registerPath].some((p) => to.path.startsWith(p))) {
        return;
    }

    // If page is marked as public (auth: false), skip authentication
    if (!requiresAuth) {
        return;
    }

    try {
        // Always check fresh auth status on route change to detect token expiry/refresh failures
        await $directusAuth.checkAuthStatus();

        const authenticated = isAuthenticated.value;

        // Handle unauthenticated users
        if (!authenticated) {
            // If this is an unauthenticated-only route, allow access
            if (authMeta?.unauthenticatedOnly) {
                return;
            }

            // Store the intended destination for redirect after login
            const redirectCookie = useCookie("directus-auth-redirect", {
                default: () => "",
                maxAge: 60 * 10, // 10 minutes
            });

            // Don't store auth pages as redirect targets
            if (!to.path.startsWith(loginPath) && !to.path.startsWith(registerPath)) {
                redirectCookie.value = to.fullPath;
            }

            // Use custom redirect path only if specified, otherwise use loginPath
            const redirectTo = authMeta?.navigateUnauthenticatedTo || loginPath;
            return navigateTo(redirectTo);
        }

        // Handle authenticated users
        if (authenticated) {
            // If this is an unauthenticated-only route, redirect authenticated users
            if (authMeta?.unauthenticatedOnly) {
                // Check if there's a stored redirect, otherwise use custom path or default
                const redirectCookie = useCookie("directus-auth-redirect", {
                    default: () => "",
                });

                // Only use custom navigateAuthenticatedTo if specified
                let redirectTo = afterLoginPath;
                if (authMeta?.navigateAuthenticatedTo) {
                    redirectTo = authMeta.navigateAuthenticatedTo;
                }

                // If there's a stored redirect and user is coming from login/register, use it
                if (redirectCookie.value && (from.path.startsWith(loginPath) || from.path.startsWith(registerPath))) {
                    redirectTo = redirectCookie.value;
                    redirectCookie.value = ""; // Clear the redirect
                }

                return navigateTo(redirectTo);
            }

            // Role-based access control
            const permissionsConfig = config.public.directus?.auth?.permissions;
            if (permissionsConfig?.enabled && (authMeta?.roles || authMeta?.excludeRoles)) {
                // Get user from auth state
                const currentUser = $directusAuth.currentUser.value;

                if (currentUser) {
                    // Extract user's role(s) using configured field
                    const roleField = permissionsConfig.field || "role";
                    let userRoleValue = currentUser[roleField];

                    // Apply transform function if configured
                    if (permissionsConfig.transform && typeof permissionsConfig.transform === "function") {
                        try {
                            userRoleValue = permissionsConfig.transform(userRoleValue, currentUser);
                        } catch (e) {
                            console.error("[directus-auth middleware] Error in transform function:", e);
                        }
                    }

                    // Normalize to array for consistent checking
                    let userRoles: string[];
                    if (Array.isArray(userRoleValue)) {
                        userRoles = userRoleValue;
                    } else if (userRoleValue != null) {
                        userRoles = [userRoleValue];
                    } else {
                        userRoles = [];
                    }

                    // Apply mapping to each role if configured
                    if (permissionsConfig.mapping) {
                        userRoles = userRoles.map((role) => permissionsConfig.mapping![role] || role);
                    }

                    // Check role requirements
                    if (authMeta.roles && authMeta.roles.length > 0) {
                        // User must have at least ONE of the specified roles (OR logic)
                        const hasPermission = authMeta.roles.some((requiredRole) => userRoles.includes(requiredRole));
                        if (!hasPermission) {
                            if (import.meta.dev) {
                                console.warn(`[directus-auth middleware] User roles [${userRoles.join(", ")}] don't match required roles:`, authMeta.roles);
                            }
                            const unauthorizedRedirect = authMeta.unauthorizedRedirect || "/";
                            return navigateTo(unauthorizedRedirect);
                        }
                    }

                    // Check role exclusions
                    if (authMeta.excludeRoles && authMeta.excludeRoles.length > 0) {
                        // User must NOT have any of these roles
                        const isExcluded = userRoles.some((role) => authMeta.excludeRoles!.includes(role));
                        if (isExcluded) {
                            if (import.meta.dev) {
                                console.warn(`[directus-auth middleware] User has excluded role in [${userRoles.join(", ")}]:`, authMeta.excludeRoles);
                            }
                            const unauthorizedRedirect = authMeta.unauthorizedRedirect || "/";
                            return navigateTo(unauthorizedRedirect);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("[directus-auth middleware] Error checking authentication:", error);

        // Store intended destination for redirect after login
        const redirectCookie = useCookie("directus-auth-redirect", {
            default: () => "",
            maxAge: 60 * 10, // 10 minutes
        });

        if (!to.path.startsWith(loginPath) && !to.path.startsWith(registerPath)) {
            redirectCookie.value = to.fullPath;
        }

        return navigateTo(loginPath);
    }

    return;
});
