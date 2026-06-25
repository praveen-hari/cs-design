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
  // Library entry — no shebang (includes SDK + CLI utilities)
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    shims: true,
  },
  // SDK entry — pure functions, no CLI deps (chalk, ora, commander)
  {
    entry: { sdk: "src/sdk/index.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    shims: true,
  },
]);
