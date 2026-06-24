import { defineConfig } from "tsup";

export default defineConfig([
  // CLI entry — needs shebang
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    dts: false,
    sourcemap: true,
    clean: true,
    splitting: false,
    shims: true,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  // Library entry — no shebang
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    dts: true,
    sourcemap: true,
    clean: false, // don't clean again, CLI build already did
    splitting: false,
    shims: true,
  },
]);
