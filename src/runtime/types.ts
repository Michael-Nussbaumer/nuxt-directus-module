// Export generated Directus schema types
// These are generated from the OpenAPI schema using openapi-typescript

export type { components, paths } from "../../../schema/schema";

// Re-export commonly used types
export type DirectusSchema = any; // Replace with your actual schema type

// Extend Nuxt RuntimeConfig types
declare module '@nuxt/schema' {
    interface PublicRuntimeConfig {
        directusUrl: string;
        directusWsUrl?: string;
        directus?: {
            enableGlobalMiddleware?: boolean;
            auth?: {
                loginPath?: string;
                registerPath?: string;
                afterLoginPath?: string;
                afterLogoutPath?: string;
                resetPasswordUrl?: string;
                verificationUrl?: string;
            };
        };
    }
}

export {};
