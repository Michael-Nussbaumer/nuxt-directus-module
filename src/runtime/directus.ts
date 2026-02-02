import { defineNuxtPlugin, useRuntimeConfig, useCookie, useState } from "#app";
import { readonly } from "vue";
import { createDirectus, rest, authentication, realtime, readMe, type AuthenticationStorage } from "@directus/sdk";

interface DirectusUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: unknown;
}

class NuxtCookieStorage implements AuthenticationStorage {
    private cookie = useCookie<string | object | null>("directus-data", {
        default: () => null,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        httpOnly: false,
    });

    get() {
        return this.cookie.value;
    }

    set(data: string | object | null) {
        this.cookie.value = data;
    }
}

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig();

    // Get API URL from runtime config (must be configured in nuxt.config.ts)
    const apiUrl = config.public.directusUrl;

    if (!apiUrl) {
        throw new Error("[Directus] NUXT_PUBLIC_DIRECTUS_URL is not configured. Please set it in your nuxt.config.ts runtimeConfig.public.directusUrl");
    }

    if (import.meta.client) {
        console.log("[Directus] Using API URL:", apiUrl);
    }

    // WebSocket URL - use direct Directus URL or custom WS URL
    // WebSockets cannot be proxied through Nitro, so we need to connect directly
    const wsBaseUrl = config.public.directusWsUrl || config.public.directusUrl;
    const wsUrl = wsBaseUrl.replace(/^http/, "ws") + "/websocket";

    if (import.meta.client) {
        console.log("[Directus] WebSocket URL:", wsUrl);
    }

    // Create custom cookie storage
    const storage = new NuxtCookieStorage();

    // Create Directus client with authentication and WebSocket
    const directusClient = createDirectus(apiUrl)
        .with(authentication("cookie", { credentials: "include", storage }))
        .with(rest({ credentials: "include" }))
        .with(
            realtime({
                url: wsUrl,
                debug: process.env.NODE_ENV === "development",
            }),
        );

    // Create reactive authentication state
    const isAuthenticatedState = useState<boolean>("directus-authenticated", () => false);
    const currentUser = useState<DirectusUser | null>("directus-user", () => null);
    const isWebSocketConnected = useState<boolean>("directus-ws-connected", () => false);

    // Initialize WebSocket connection (client-only)
    const initializeWebSocket = () => {
        if (!import.meta.client) return;

        try {
            directusClient.connect();

            directusClient.onWebSocket("open", () => {
                console.log("[Directus] WebSocket connection established");
                isWebSocketConnected.value = true;
            });

            directusClient.onWebSocket("close", () => {
                console.log("[Directus] WebSocket connection closed");
                isWebSocketConnected.value = false;
            });

            directusClient.onWebSocket("error", (error) => {
                console.error("[Directus] WebSocket error:", error);
                isWebSocketConnected.value = false;
            });

            directusClient.onWebSocket("message", (message) => {
                console.log("[Directus] WebSocket message:", message);
            });
        } catch (error) {
            console.error("[Directus] WebSocket connection failed:", error);
        }
    };

    // Check authentication status
    const checkAuthStatus = async () => {
        try {
            const me = await directusClient.request(readMe());
            isAuthenticatedState.value = true;
            currentUser.value = me as DirectusUser;

            // Initialize WebSocket when authenticated
            if (!isWebSocketConnected.value) {
                initializeWebSocket();
            }

            return me;
        } catch (error) {
            isAuthenticatedState.value = false;
            currentUser.value = null;
            return false;
        }
    };

    // Helper to get refresh token
    const getRefreshToken = () => {
        const refreshToken = useCookie("directus_refresh_token", {
            default: () => null,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            httpOnly: false,
        });
        return refreshToken.value;
    };

    // Auto-check auth status on plugin setup (only on client-side)
    if (import.meta.client) {
        await checkAuthStatus();
    }

    return {
        provide: {
            directus: directusClient,
            directusAuth: {
                isAuthenticated: readonly(isAuthenticatedState),
                currentUser: readonly(currentUser),
                checkAuthStatus,
                getRefreshToken,
            },
            directusWs: {
                isConnected: readonly(isWebSocketConnected),
                initialize: initializeWebSocket,
            },
        },
    };
});
