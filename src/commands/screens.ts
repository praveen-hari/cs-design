/**
 * `cs-design screens list` command — List all screens in the project.
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import type { ProjectJson, ScreenEntry } from "../types.js";
import { PROJECT_JSON, SCREENS_DIR } from "../constants.js";
import { requireProject } from "../utils.js";

export interface ScreensListOptions {
  json: boolean;
}

export async function screensListCommand(
  options: ScreensListOptions
): Promise<void> {
  const designsDir = await requireProject();

  // Read project.json
  const projectPath = path.join(designsDir, PROJECT_JSON);
  if (!(await fs.pathExists(projectPath))) {
    console.error(
      chalk.red(`No ${PROJECT_JSON} found in .designs/ directory.`)
    );
    process.exit(1);
  }

  const project: ProjectJson = await fs.readJson(projectPath);
  const screensDir = path.join(designsDir, SCREENS_DIR);

  // Collect screens from project.json
  const registeredScreens = new Map<string, ScreenEntry>();
  if (project.screens) {
    for (const [key, entry] of Object.entries(project.screens)) {
      registeredScreens.set(entry.file || `${key}.html`, entry);
    }
  }

  // Scan screens/ directory for any .html files not in project.json
  const allScreens: ScreenEntry[] = [];
  if (await fs.pathExists(screensDir)) {
    const files = await fs.readdir(screensDir);
    const htmlFiles = files.filter((f) => f.endsWith(".html")).sort();

    for (const file of htmlFiles) {
      if (registeredScreens.has(file)) {
        allScreens.push(registeredScreens.get(file)!);
      } else {
        // Unregistered screen — derive name from filename
        const name = path.basename(file, ".html");
        allScreens.push({
          name,
          file,
          description: "(unregistered — not in project.json)",
        });
      }
    }
  }

  // Also add registered screens whose files might not exist yet
  for (const [file, entry] of registeredScreens) {
    if (!allScreens.some((s) => s.file === file)) {
      allScreens.push(entry);
    }
  }

  // Output
  if (options.json) {
    const output = {
      project: project.name,
      system: project.system,
      screens: allScreens.map((s) => ({
        name: s.name,
        file: s.file,
        description: s.description,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Human-readable output
  console.log();
  console.log(
    `${chalk.bold("Project:")} ${project.name} ${chalk.dim(`(${project.system})`)}`
  );
  console.log();

  if (allScreens.length === 0) {
    console.log(chalk.dim("  No screens yet."));
    console.log();
    console.log(
      `  ${chalk.dim("Ask your AI agent to generate screens using the design system.")}`
    );
  } else {
    for (const screen of allScreens) {
      const fileName = chalk.cyan(screen.file.padEnd(22));
      console.log(`  ${fileName} ${screen.description}`);
    }
    console.log();
    console.log(
      `${allScreens.length} screen${allScreens.length !== 1 ? "s" : ""}`
    );
  }
  console.log();
}
