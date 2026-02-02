export default defineNuxtConfig({
    modules: ["../src/module"],
    devtools: { enabled: true },

    compatibilityDate: "2024-11-01",

    directus: {
        enableGlobalMiddleware: true,
        auth: {
            loginPath: "/login",
            afterLoginPath: "/dashboard",
        },
        types: {
            enabled: false, // Enable in development when Directus is available
            openApiUrl: "http://directus.local/server/specs/oas",
            output: "./schema/schema.d.ts",
            authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
        },
    },
});
