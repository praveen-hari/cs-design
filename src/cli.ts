/**
 * cs-design CLI entry point.
 *
 * Usage:
 *   cs-design init <project-name> [--system <id>] [--force]
 *   cs-design validate
 *   cs-design screens list [--json]
 *   cs-design systems list
 *   cs-design systems install <source>
 *   cs-design systems create <name>
 *   cs-design export tokens --format <css|tailwind|json> [--out <path>]
 *   cs-design skills add <framework> [--only <components>]
 *   cs-design skills list [--json]
 *   cs-design skills remove <framework>
 */

import { Command } from "commander";
import {
  initCommand,
  validateCommand,
  screensListCommand,
  systemsListCommand,
  systemsInstallCommand,
  systemsCreateCommand,
  exportTokensCommand,
} from "./commands/index.js";
import {
  skillsAddCommand,
  skillsListCommand,
  skillsRemoveCommand,
} from "./commands/skills.js";
import { getFrameworkIds } from "./skills-registry.js";
import type { TokenFormat } from "./types.js";

const VERSION = "0.1.0";

const program = new Command();

program
  .name("cs-design")
  .description(
    "A CLI tool that provides design system context for AI coding agents."
  )
  .version(VERSION, "-v, --version");

// ── init ──

program
  .command("init")
  .description("Initialize a new design project in the current directory")
  .argument("<project-name>", "Display name for the project")
  .option(
    "-s, --system <system-id>",
    "Design system to use",
    "modern-minimal"
  )
  .option("-f, --force", "Overwrite existing .designs/ directory", false)
  .action(async (projectName: string, options: { system: string; force: boolean }) => {
    await initCommand(projectName, options);
  });

// ── validate ──

program
  .command("validate")
  .description("Validate the current project's DESIGN.md against the specification")
  .action(async () => {
    await validateCommand();
  });

// ── screens ──

const screens = program
  .command("screens")
  .description("Manage project screens");

screens
  .command("list")
  .description("List all screens in the current project")
  .option("--json", "Output as JSON", false)
  .action(async (options: { json: boolean }) => {
    await screensListCommand(options);
  });

// ── systems ──

const systems = program
  .command("systems")
  .description("Manage design systems");

systems
  .command("list")
  .description("List all available design systems (built-in + installed)")
  .action(async () => {
    await systemsListCommand();
  });

systems
  .command("install")
  .description("Install a design system from a source")
  .argument(
    "<source>",
    "Source: registry name, github:user/repo, or local path"
  )
  .action(async (source: string) => {
    await systemsInstallCommand(source);
  });

systems
  .command("create")
  .description("Scaffold a new empty design system")
  .argument("<name>", "Name for the new design system")
  .action(async (name: string) => {
    await systemsCreateCommand(name);
  });

// ── export ──

const exportCmd = program
  .command("export")
  .description("Export design artifacts");

exportCmd
  .command("tokens")
  .description("Export design tokens from DESIGN.md to other formats")
  .requiredOption(
    "--format <format>",
    "Output format: css, tailwind, or json"
  )
  .option("--out <path>", "Output file path (default: .designs/tokens.<ext>)")
  .action(async (options: { format: string; out?: string }) => {
    const validFormats: TokenFormat[] = ["css", "tailwind", "json"];
    if (!validFormats.includes(options.format as TokenFormat)) {
      console.error(
        `Invalid format "${options.format}". Supported: ${validFormats.join(", ")}`
      );
      process.exit(1);
    }
    await exportTokensCommand({
      format: options.format as TokenFormat,
      out: options.out,
    });
  });

// ── skills ──

const skills = program
  .command("skills")
  .description("Manage Syncfusion component skills for AI agents");

skills
  .command("add")
  .description("Install Syncfusion component skills for a framework")
  .argument(
    "<framework>",
    `Framework: ${getFrameworkIds().join(", ")}`
  )
  .option(
    "--only <components>",
    "Install only specific components (comma-separated, e.g. grid,scheduler,charts)"
  )
  .action(async (framework: string, options: { only?: string }) => {
    await skillsAddCommand(framework, options);
  });

skills
  .command("list")
  .description("List installed Syncfusion component skills")
  .option("--json", "Output as JSON", false)
  .action(async (options: { json: boolean }) => {
    await skillsListCommand(options);
  });

skills
  .command("remove")
  .description("Remove Syncfusion component skills for a framework")
  .argument(
    "<framework>",
    `Framework: ${getFrameworkIds().join(", ")}`
  )
  .action(async (framework: string) => {
    await skillsRemoveCommand(framework);
  });

// ── Parse and run ──

program.parse();
