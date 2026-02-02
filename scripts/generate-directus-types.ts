import { execa } from "execa";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

interface TypesConfig {
    enabled: boolean;
    openApiUrl?: string;
    output: string;
    redoclyConfig?: string;
    authHeaderEnv: string;
}

// Default configuration
const defaultConfig: TypesConfig = {
    enabled: false,
    openApiUrl: "",
    output: "./schema/schema.d.ts",
    authHeaderEnv: "DIRECTUS_OPENAPI_TOKEN",
};

async function generateDirectusTypes() {
    console.log("🔄 Generating Directus TypeScript types...\n");

    // Read configuration from environment or use defaults
    const config: TypesConfig = {
        enabled: process.env.DIRECTUS_TYPES_ENABLED === "true" || true,
        openApiUrl: process.env.DIRECTUS_OPENAPI_URL || "http://directus.local/server/specs/oas",
        output: process.env.DIRECTUS_TYPES_OUTPUT || defaultConfig.output,
        redoclyConfig: process.env.DIRECTUS_REDOCLY_CONFIG,
        authHeaderEnv: process.env.DIRECTUS_AUTH_HEADER_ENV || defaultConfig.authHeaderEnv,
    };

    // Skip if types generation is disabled
    if (!config.enabled) {
        console.log("ℹ️  Type generation is disabled. Skipping...");
        return;
    }

    // Check if OpenAPI URL is provided
    if (!config.openApiUrl) {
        console.error("❌ Error: DIRECTUS_OPENAPI_URL is required for type generation");
        console.error("   Set it in your .env file or via environment variable");
        process.exit(1);
    }

    // Read auth token from environment
    const authToken = process.env[config.authHeaderEnv];

    if (!authToken) {
        console.warn(`⚠️  Warning: ${config.authHeaderEnv} environment variable not set`);
        console.warn("   Type generation may fail if the API requires authentication\n");
    }

    // Ensure output directory exists
    const outputPath = resolve(process.cwd(), config.output);
    const outputDir = dirname(outputPath);

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${outputDir}`);
    }

    // Build openapi-typescript command arguments
    const args = [config.openApiUrl, "-o", outputPath];

    // Add Redocly config if provided
    if (config.redoclyConfig) {
        args.push("--redocly", config.redoclyConfig);
    }

    // Add authorization header if token is available
    const env: Record<string, string> = { ...process.env };

    try {
        console.log(`📡 Fetching OpenAPI schema from: ${config.openApiUrl}`);
        console.log(`📝 Output file: ${outputPath}\n`);

        // Execute openapi-typescript
        const { stdout, stderr } = await execa("npx", ["openapi-typescript", ...args], {
            env: authToken
                ? {
                      ...env,
                      OPENAPI_TYPESCRIPT_HEADERS: JSON.stringify({
                          Authorization: authToken,
                      }),
                  }
                : env,
        });

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        console.log("\n✅ TypeScript types generated successfully!");
        console.log(`   Location: ${outputPath}`);
    } catch (error: any) {
        console.error("\n❌ Failed to generate types:");
        console.error(error.message);

        if (error.stderr) {
            console.error("\nDetails:");
            console.error(error.stderr);
        }

        console.error("\n💡 Troubleshooting:");
        console.error("   - Verify the OpenAPI URL is accessible");
        console.error("   - Check if authentication token is valid");
        console.error(`   - Ensure ${config.authHeaderEnv} environment variable is set correctly`);

        process.exit(1);
    }
}

// Run the script
generateDirectusTypes().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
