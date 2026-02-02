import { ref, computed } from "vue";
import { useNuxtApp, navigateTo, useRuntimeConfig, useCookie } from "#app";
import { refresh, registerUser, registerUserVerify, passwordRequest, passwordReset, createDirectus, rest, updateMe } from "@directus/sdk";
import type { DirectusClient, RestCommand } from "@directus/sdk";

export interface DirectusUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: any;
}

export interface LoginCredentials {
    email: string;
    password: string;
    otp?: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
}

export const useDirectusAuth = () => {
    const { $directus, $directusAuth, $directusWs } = useNuxtApp();
    const config = useRuntimeConfig();

    // Use plugin's reactive state
    const isAuthenticated = computed(() => $directusAuth.isAuthenticated.value);
    const user = computed(() => $directusAuth.currentUser.value);

    const isLoading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Login with email and password (and optional OTP for 2FA)
     */
    const login = async (credentials: LoginCredentials) => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;

            // Authenticate with Directus (with OTP if provided)
            const loginData: any = {
                email: credentials.email,
                password: credentials.password,
            };
            if (credentials.otp) {
                loginData.otp = credentials.otp;
            }
            await client.login(loginData, { mode: "cookie" });

            // Update auth state
            await $directusAuth.checkAuthStatus();

            // Initialize WebSocket if not connected
            if (!$directusWs.isConnected.value) {
                $directusWs.initialize();
            }

            // Check for stored redirect
            const redirectCookie = useCookie("directus-auth-redirect", {
                default: () => "",
            });

            const afterLoginPath = config.public.directus?.auth?.afterLoginPath || "/";
            const redirectTo = redirectCookie.value || afterLoginPath;

            // Clear redirect cookie
            redirectCookie.value = "";

            await navigateTo(redirectTo);

            return user.value;
        } catch (e: any) {
            error.value = e.message || "Login failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Logout the current user
     */
    const logout = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;
            const refresh_token = $directusAuth.getRefreshToken();

            if (refresh_token) {
                await client.logout({ mode: "cookie", refresh_token });
            } else {
                await client.logout({ mode: "cookie" });
            }

            // Clear cookies
            const refreshTokenCookie = useCookie("directus_refresh_token", {
                default: () => null,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                httpOnly: false,
            });
            refreshTokenCookie.value = null;

            const dataCookie = useCookie("directus-data", {
                default: () => null,
            });
            dataCookie.value = null;

            // Update auth state
            await $directusAuth.checkAuthStatus();

            // Navigate to after logout path
            const afterLogoutPath = config.public.directus?.auth?.afterLogoutPath || "/login";
            await navigateTo(afterLogoutPath);
        } catch (e: any) {
            error.value = e.message || "Logout failed";

            // Clear local state even if server logout fails
            const refreshTokenCookie = useCookie("directus_refresh_token");
            refreshTokenCookie.value = null;
            const dataCookie = useCookie("directus-data");
            dataCookie.value = null;

            await $directusAuth.checkAuthStatus();

            const afterLogoutPath = config.public.directus?.auth?.afterLogoutPath || "/login";
            await navigateTo(afterLogoutPath);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Register a new user
     */
    const register = async (data: RegisterData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const apiUrl = config.public.directusUrl;

            const publicClient = createDirectus(apiUrl).with(rest());

            // Get the base URL for verification email
            const baseUrl = config.public.directus?.auth?.verificationUrl || `${window.location.origin}/auth/verify-email`;

            // Use Directus SDK registerUser with additional fields
            await publicClient.request(
                registerUser(data.email, data.password, {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    verification_url: baseUrl,
                }),
            );

            return true;
        } catch (e: any) {
            error.value = e.message || "Registration failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Verify email with token
     */
    const verifyEmail = async (token: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const apiUrl = config.public.directusUrl;

            const publicClient = createDirectus(apiUrl).with(rest());

            // Use Directus SDK verifyUserEmail
            await publicClient.request(registerUserVerify(token));

            return true;
        } catch (e: any) {
            error.value = e.message || "Email verification failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Fetch current user data
     */
    const fetchUser = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            await $directusAuth.checkAuthStatus();
            return user.value;
        } catch (e: any) {
            error.value = e.message || "Failed to fetch user";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Request password reset
     */
    const requestPasswordReset = async (email: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const apiUrl = config.public.directusUrl;

            // Get the base URL for password reset email
            const resetUrl = config.public.directus?.auth?.resetPasswordUrl || `${window.location.origin}/auth/reset-password`;

            const publicClient = createDirectus(apiUrl).with(rest());

            // Use fetch directly for public endpoint (no a
            await publicClient.request(passwordRequest(email, resetUrl));

            return true;
        } catch (e: any) {
            error.value = e.message || "Password reset request failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Reset password with token
     */
    const resetPassword = async (token: string, password: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const apiUrl = config.public.directusUrl;

            // Create a fresh client without authentication for public endpoint
            const publicClient = createDirectus(apiUrl).with(rest());

            // Use fetch directly for public endpoint (no a
            await publicClient.request(passwordReset(token, password));

            return true;
        } catch (e: any) {
            error.value = e.message || "Password reset failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Refresh authentication token
     */
    const refreshToken = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;
            await client.request(refresh({ mode: "cookie" }));
            await $directusAuth.checkAuthStatus();
            return true;
        } catch (e: any) {
            error.value = e.message || "Token refresh failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Get user's roles as array (with mapping and transformation applied)
     */
    const userRoles = computed(() => {
        if (!user.value) return [];

        const permissionsConfig = config.public.directus?.auth?.permissions;
        if (!permissionsConfig?.enabled) return [];

        const roleField = permissionsConfig.field || "role";
        let roleValue = user.value[roleField];

        // Apply transform function if configured
        if (permissionsConfig.transform && typeof permissionsConfig.transform === "function") {
            try {
                roleValue = permissionsConfig.transform(roleValue, user.value);
            } catch (e) {
                console.error("[useDirectusAuth] Error in transform function:", e);
            }
        }

        // Normalize to array
        let roles: string[];
        if (Array.isArray(roleValue)) {
            roles = roleValue;
        } else if (roleValue != null) {
            roles = [roleValue];
        } else {
            roles = [];
        }

        // Apply mapping if configured
        if (permissionsConfig.mapping) {
            roles = roles.map((role) => permissionsConfig.mapping![role] || role);
        }

        return roles;
    });

    /**
     * Get user's primary role (first role in array, for convenience)
     */
    const userRole = computed(() => {
        return userRoles.value[0] || null;
    });

    /**
     * Get raw role value (untransformed, unmapped)
     */
    const userRoleRaw = computed(() => {
        if (!user.value) return null;
        const roleField = config.public.directus?.auth?.permissions?.field || "role";
        return user.value[roleField];
    });

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: string): boolean => {
        return userRoles.value.includes(role);
    };

    /**
     * Check if user has any of the specified roles
     */
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some((role) => userRoles.value.includes(role));
    };

    /**
     * Check if user has all of the specified roles
     */
    const hasAllRoles = (roles: string[]): boolean => {
        return roles.every((role) => userRoles.value.includes(role));
    };

    /**
     * Check if user is NOT in any of the excluded roles
     */
    const isNotRole = (roles: string[]): boolean => {
        return !roles.some((role) => userRoles.value.includes(role));
    };

    /**
     * Update current user password
     */
    const updatePassword = async (currentPassword: string, newPassword: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;

            // Update password
            await client.request(
                updateMe({
                    password: newPassword,
                }),
            );

            return true;
        } catch (e: any) {
            error.value = e.message || "Password update failed";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Generate 2FA secret
     */
    const generateTwoFactorSecret = async (password: string): Promise<{ secret: string; otpauth_url: string }> => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;

            // Custom command for generating 2FA secret
            const generateTFACommand = (): RestCommand<{ secret: string; otpauth_url: string }, any> => () => ({
                path: `/users/me/tfa/generate`,
                method: "POST",
                body: JSON.stringify({ password }),
            });

            const result = await client.request(generateTFACommand());
            return result;
        } catch (e: any) {
            error.value = e.message || "Failed to generate 2FA secret";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Enable 2FA
     */
    const enableTwoFactor = async (secret: string, otp: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;

            // Custom command for enabling 2FA
            const enableTFACommand = (): RestCommand<void, any> => () => ({
                path: `/users/me/tfa/enable`,
                method: "POST",
                body: JSON.stringify({ secret, otp }),
            });

            await client.request(enableTFACommand());

            // Refresh user data to get updated tfa_secret field
            await $directusAuth.checkAuthStatus();

            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to enable 2FA";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Disable 2FA
     */
    const disableTwoFactor = async (otp: string) => {
        isLoading.value = true;
        error.value = null;

        try {
            const client = $directus as DirectusClient<any>;

            // Custom command for disabling 2FA
            const disableTFACommand = (): RestCommand<void, any> => () => ({
                path: `/users/me/tfa/disable`,
                method: "POST",
                body: JSON.stringify({ otp }),
            });

            await client.request(disableTFACommand());

            // Refresh user data to get updated tfa_secret field
            await $directusAuth.checkAuthStatus();

            return true;
        } catch (e: any) {
            error.value = e.message || "Failed to disable 2FA";
            throw e;
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Check if 2FA is enabled for current user
     */
    const isTwoFactorEnabled = computed(() => {
        return user.value?.tfa_secret !== null && user.value?.tfa_secret !== undefined;
    });

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        register,
        verifyEmail,
        fetchUser,
        requestPasswordReset,
        resetPassword,
        refreshToken,
        userRoles,
        userRole,
        userRoleRaw,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isNotRole,
        updatePassword,
        generateTwoFactorSecret,
        enableTwoFactor,
        disableTwoFactor,
        isTwoFactorEnabled,
    };
};
