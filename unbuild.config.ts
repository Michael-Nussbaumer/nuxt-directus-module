import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/module"],
    declaration: true,
    clean: true,
    externals: ["@nuxt/kit", "@nuxt/schema", "nuxt"],
    rollup: {
        emitCJS: true,
    },
});
