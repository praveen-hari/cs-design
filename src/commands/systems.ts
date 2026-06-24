/**
 * `cs-design systems` commands — list, install, create design systems.
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { DESIGN_MD, getGlobalSystemsDir } from "../constants.js";
import {
  getBuiltinSystems,
  getInstalledSystems,
} from "../systems/index.js";
import { parseDesignMd, logError, logWarning } from "../utils.js";
import { generateEmptyDesignMd } from "../templates/design-system.js";

// ── systems list ──

export async function systemsListCommand(): Promise<void> {
  const builtins = getBuiltinSystems();
  const installed = await getInstalledSystems();

  console.log();
  console.log(chalk.bold("Built-in:"));
  for (const sys of builtins) {
    const id = chalk.cyan(sys.id.padEnd(22));
    console.log(`  ${id} ${sys.description}`);
  }

  console.log();
  console.log(chalk.bold("Installed:"));
  if (installed.length === 0) {
    console.log(chalk.dim("  (none)"));
  } else {
    for (const sys of installed) {
      const id = chalk.cyan(sys.id.padEnd(22));
      console.log(`  ${id} ${sys.description}`);
    }
  }
  console.log();
}

// ── systems install ──

export async function systemsInstallCommand(source: string): Promise<void> {
  const spinner = ora(`Installing design system from "${source}"...`).start();

  try {
    let content: string;
    let systemId: string;

    if (source.startsWith("github:")) {
      // GitHub source: github:user/repo
      const repoPath = source.replace("github:", "");
      const rawUrl = `https://raw.githubusercontent.com/${repoPath}/main/DESIGN.md`;

      spinner.text = `Fetching from GitHub: ${repoPath}...`;
      const response = await fetch(rawUrl);

      if (!response.ok) {
        // Try master branch
        const masterUrl = `https://raw.githubusercontent.com/${repoPath}/master/DESIGN.md`;
        const masterResponse = await fetch(masterUrl);
        if (!masterResponse.ok) {
          throw new Error(
            `Could not fetch DESIGN.md from ${repoPath} (tried main and master branches)`
          );
        }
        content = await masterResponse.text();
      } else {
        content = await response.text();
      }

      // Derive system ID from repo name
      systemId = repoPath.split("/").pop() || repoPath.replace("/", "-");
    } else if (
      source.startsWith("./") ||
      source.startsWith("/") ||
      source.startsWith("../")
    ) {
      // Local path
      const localPath = path.resolve(source);
      const designPath = (await fs.stat(localPath)).isDirectory()
        ? path.join(localPath, DESIGN_MD)
        : localPath;

      if (!(await fs.pathExists(designPath))) {
        throw new Error(`No DESIGN.md found at ${designPath}`);
      }

      content = await fs.readFile(designPath, "utf-8");
      systemId = path.basename(path.dirname(designPath));
      if (systemId === "." || systemId === "..") {
        systemId = path.basename(designPath, ".md").toLowerCase();
      }
    } else {
      // Registry name (future: fetch from registry)
      // For now, treat as a local path or show helpful error
      throw new Error(
        `Registry install is not yet supported. Use a local path or GitHub source:\n` +
          `  cs-design systems install ./my-system/\n` +
          `  cs-design systems install github:user/repo`
      );
    }

    // Validate the DESIGN.md
    spinner.text = "Validating DESIGN.md...";
    const parsed = parseDesignMd(content);
    if (!parsed) {
      throw new Error(
        "Invalid DESIGN.md — could not parse YAML front matter."
      );
    }

    if (!parsed.yaml.name) {
      throw new Error('Invalid DESIGN.md — missing "name" field in YAML.');
    }

    if (!parsed.yaml.colors) {
      throw new Error('Invalid DESIGN.md — missing "colors" section in YAML.');
    }

    if (!parsed.yaml.typography) {
      throw new Error(
        'Invalid DESIGN.md — missing "typography" section in YAML.'
      );
    }

    // Use the YAML name as system ID if available, sanitized
    const finalId = systemId
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Write to global systems directory
    spinner.text = `Installing as "${finalId}"...`;
    const installDir = path.join(getGlobalSystemsDir(), finalId);
    await fs.ensureDir(installDir);
    await fs.writeFile(path.join(installDir, DESIGN_MD), content, "utf-8");

    spinner.succeed(`Installed "${parsed.yaml.name}" as ${chalk.cyan(finalId)}`);
    console.log();
    console.log(
      `  ${chalk.dim("Use it with:")} cs-design init "My App" --system ${finalId}`
    );
    console.log();
  } catch (error) {
    spinner.fail("Installation failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}

// ── systems create ──

export async function systemsCreateCommand(name: string): Promise<void> {
  const systemId = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const installDir = path.join(getGlobalSystemsDir(), systemId);

  if (await fs.pathExists(installDir)) {
    logWarning(
      `System "${systemId}" already exists at ${chalk.dim(installDir)}`
    );
    logError("Use a different name or remove the existing system first.");
    process.exit(1);
  }

  const spinner = ora(`Creating design system "${name}"...`).start();

  try {
    await fs.ensureDir(installDir);
    const content = generateEmptyDesignMd(name);
    await fs.writeFile(path.join(installDir, DESIGN_MD), content, "utf-8");

    spinner.succeed(`Created design system "${name}"`);
    console.log();
    console.log(`  ${chalk.bold("ID:")}       ${systemId}`);
    console.log(`  ${chalk.bold("Location:")} ${chalk.dim(installDir)}`);
    console.log();
    console.log(
      `  ${chalk.dim("Edit")} ${chalk.cyan(path.join(installDir, DESIGN_MD))} ${chalk.dim("to customize your design system.")}`
    );
    console.log(
      `  ${chalk.dim("Use it with:")} cs-design init "My App" --system ${systemId}`
    );
    console.log();
  } catch (error) {
    spinner.fail("Failed to create design system.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
