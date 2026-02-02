import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addRouteMiddleware } from "@nuxt/kit";
import { defu } from "defu";

export interface DirectusPermissionsConfig {
    enabled: boolean;
    field: string;
    mapping?: Record<string, string>;
    transform?: (fieldValue: any, user: any) => string | string[];
}

export interface DirectusAuthConfig {
    loginPath: string;
    registerPath: string;
    afterLoginPath: string;
    afterLogoutPath: string;
    resetPasswordUrl?: string;
    verificationUrl?: string;
    permissions?: DirectusPermissionsConfig;
}

export interface DirectusTypesConfig {
    enabled: boolean;
    openApiUrl?: string;
    output: string;
    redoclyConfig?: string;
    authHeaderEnv: string;
}

export interface ModuleOptions {
    enableGlobalMiddleware: boolean;
    auth: DirectusAuthConfig;
    types: DirectusTypesConfig;
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "@michael-nussbaumer/nuxt-directus",
        configKey: "directus",
        compatibility: {
            nuxt: "^3.0.0 || ^4.0.0",
        },
    },
    defaults: {
        enableGlobalMiddleware: true,
        auth: {
            loginPath: "/auth/login",
            registerPath: "/auth/register",
            afterLoginPath: "/",
            afterLogoutPath: "/auth/login",
            permissions: {
                enabled: false,
                field: "role",
            },
        },
        types: {
            enabled: false,
            output: "./schema/schema.d.ts",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url);

        // Merge module options with Nuxt runtime config
        nuxt.options.runtimeConfig.public.directus = defu(nuxt.options.runtimeConfig.public.directus as any, {
            enableGlobalMiddleware: options.enableGlobalMiddleware,
            auth: options.auth,
        });

        // Add runtime directory
        nuxt.options.alias["#directus"] = resolver.resolve("./runtime");

        // Add composables
        addImportsDir(resolver.resolve("./runtime/composables"));

        // Always add the auth middleware (it will check enableGlobalMiddleware internally)
        addRouteMiddleware({
            name: "directus-auth",
            path: resolver.resolve("./runtime/middleware/directus-auth"),
            global: true,
        });

        // Add runtime plugin for Directus client
        addPlugin(resolver.resolve("./runtime/directus"));

        // Add TypeScript type declarations
        nuxt.hook("prepare:types", ({ references }) => {
            references.push({ path: resolver.resolve("./runtime/types") });
        });
    },
});
