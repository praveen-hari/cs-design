/**
 * `cs-design skills` commands — add, list, remove Syncfusion component skills.
 *
 * Non-interactive alternative to `npx skills add`.
 * Clones the Syncfusion skills repo, copies skill folders to ~/.agents/skills/,
 * and creates symlinks in all standard agent directories.
 */

import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import chalk from "chalk";
import ora from "ora";
import {
  getFramework,
  getFrameworks,
  getCanonicalSkillsDir,
  getSymlinkTargets,
  getRepoUrl,
  type FrameworkEntry,
} from "../skills-registry.js";
import { logSuccess, logError, logWarning, logInfo } from "../utils.js";

// ── Helpers ──

function getTmpDir(): string {
  return path.join(os.tmpdir(), "cs-design-skills-clone");
}

/**
 * Clone a Syncfusion skills repo to a temp directory.
 */
function cloneRepo(framework: FrameworkEntry): string {
  const tmpDir = getTmpDir();
  const cloneDir = path.join(tmpDir, framework.id);

  // Clean previous clone
  fs.removeSync(cloneDir);
  fs.ensureDirSync(tmpDir);

  const url = getRepoUrl(framework);
  execSync(`git clone --depth 1 "${url}" "${cloneDir}"`, {
    stdio: "pipe",
    timeout: 60000,
  });

  return cloneDir;
}

/**
 * Find the skills directory inside the cloned repo.
 * Syncfusion repos use either `skills/` or root-level skill folders.
 */
function findSkillsRoot(cloneDir: string): string {
  const skillsSubdir = path.join(cloneDir, "skills");
  if (fs.existsSync(skillsSubdir)) return skillsSubdir;
  return cloneDir;
}

/**
 * Get all skill folder names from a cloned repo.
 */
function listSkillFolders(skillsRoot: string): string[] {
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        fs.existsSync(path.join(skillsRoot, d.name, "SKILL.md"))
    )
    .map((d) => d.name);
}

/**
 * Create a relative symlink, removing any existing broken link first.
 */
function ensureSymlink(
  canonicalPath: string,
  targetDir: string,
  skillName: string
): void {
  const linkPath = path.join(targetDir, skillName);

  // Remove existing (possibly broken) symlink
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      fs.removeSync(linkPath);
    }
  } catch {
    // Doesn't exist — fine
  }

  // Create relative symlink: ../../.agents/skills/<name>
  const relativePath = path.relative(targetDir, canonicalPath);
  fs.ensureDirSync(targetDir);
  fs.symlinkSync(relativePath, linkPath);
}

// ── skills add ──

export interface SkillsAddOptions {
  only?: string;
}

export async function skillsAddCommand(
  frameworkId: string,
  options: SkillsAddOptions
): Promise<void> {
  const framework = getFramework(frameworkId);
  if (!framework) {
    logError(`Unknown framework "${frameworkId}".`);
    console.log();
    console.log("Available frameworks:");
    for (const f of getFrameworks()) {
      console.log(`  ${chalk.cyan(f.id.padEnd(14))} ${f.name}`);
    }
    process.exit(1);
  }

  const spinner = ora(
    `Installing Syncfusion ${framework.name} component skills...`
  ).start();

  try {
    // 1. Clone the repo
    spinner.text = `Cloning ${framework.repo}...`;
    const cloneDir = cloneRepo(framework);
    const skillsRoot = findSkillsRoot(cloneDir);

    // 2. Get available skills
    let skillNames = listSkillFolders(skillsRoot);

    if (skillNames.length === 0) {
      spinner.fail("No skills found in the repository.");
      process.exit(1);
    }

    // 3. Filter if --only specified
    if (options.only) {
      const requested = options.only.split(",").map((s) => s.trim());
      const filtered: string[] = [];

      for (const req of requested) {
        // Match by full name or suffix
        const match = skillNames.find(
          (name) => name === req || name.endsWith(`-${req}`)
        );
        if (match) {
          filtered.push(match);
        } else {
          logWarning(`Skill "${req}" not found in ${framework.repo}`);
        }
      }

      if (filtered.length === 0) {
        spinner.fail("No matching skills found.");
        console.log();
        console.log("Available skills:");
        for (const name of skillNames.slice(0, 20)) {
          console.log(`  ${chalk.dim(name)}`);
        }
        if (skillNames.length > 20) {
          console.log(`  ${chalk.dim(`...and ${skillNames.length - 20} more`)}`);
        }
        process.exit(1);
      }

      skillNames = filtered;
    }

    // 4. Copy to canonical location
    spinner.text = `Installing ${skillNames.length} skills...`;
    const canonicalDir = getCanonicalSkillsDir();
    fs.ensureDirSync(canonicalDir);

    let installed = 0;
    for (const skillName of skillNames) {
      const src = path.join(skillsRoot, skillName);
      const dest = path.join(canonicalDir, skillName);

      // Copy skill folder (overwrite if exists)
      fs.copySync(src, dest, { overwrite: true });
      installed++;
    }

    // 5. Create symlinks in all agent directories
    spinner.text = "Creating symlinks for agent discovery...";
    const symlinkTargets = getSymlinkTargets();
    let linkedAgents = 0;

    for (const targetDir of symlinkTargets) {
      try {
        for (const skillName of skillNames) {
          const canonicalPath = path.join(canonicalDir, skillName);
          ensureSymlink(canonicalPath, targetDir, skillName);
        }
        linkedAgents++;
      } catch {
        // Skip if directory can't be created (e.g. agent not installed)
      }
    }

    // 6. Cleanup temp clone
    fs.removeSync(getTmpDir());

    spinner.succeed(
      `Installed ${chalk.bold(installed)} Syncfusion ${framework.name} skills`
    );
    console.log();
    console.log(
      `  ${chalk.bold("Canonical:")} ${chalk.dim(canonicalDir)}`
    );
    console.log(
      `  ${chalk.bold("Linked to:")} ${linkedAgents} agent directories`
    );
    console.log();

    // Show installed skills
    if (installed <= 15) {
      for (const name of skillNames) {
        logSuccess(name);
      }
    } else {
      for (const name of skillNames.slice(0, 10)) {
        logSuccess(name);
      }
      console.log(
        chalk.dim(`  ...and ${installed - 10} more`)
      );
    }

    console.log();
    console.log(
      chalk.dim(
        "  Skills are now available to all AI agents (Code Studio, Claude, Copilot, Cursor, etc.)"
      )
    );
    console.log();
  } catch (error) {
    spinner.fail("Installation failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);

    // Check common issues
    if (message.includes("git")) {
      logInfo("Make sure git is installed and you have internet access.");
    }
    if (message.includes("not found") || message.includes("Repository")) {
      logInfo(
        `Repository ${framework.repo} may not be available yet.`
      );
    }

    process.exit(1);
  }
}

// ── skills list ──

export interface SkillsListOptions {
  json: boolean;
}

export async function skillsListCommand(
  options: SkillsListOptions
): Promise<void> {
  const canonicalDir = getCanonicalSkillsDir();

  if (!fs.existsSync(canonicalDir)) {
    if (options.json) {
      console.log(JSON.stringify({ skills: [] }, null, 2));
    } else {
      console.log();
      console.log(chalk.dim("  No Syncfusion skills installed."));
      console.log();
      console.log(
        `  Run ${chalk.cyan("cs-design skills add <framework>")} to install.`
      );
      console.log();
    }
    return;
  }

  // Find all syncfusion skill folders
  const entries = fs
    .readdirSync(canonicalDir, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        d.name.startsWith("syncfusion-") &&
        fs.existsSync(path.join(canonicalDir, d.name, "SKILL.md"))
    )
    .map((d) => d.name)
    .sort();

  if (options.json) {
    // Group by framework
    const grouped: Record<string, string[]> = {};
    for (const name of entries) {
      const framework = detectFramework(name);
      if (!grouped[framework]) grouped[framework] = [];
      grouped[framework].push(name);
    }
    console.log(
      JSON.stringify({ total: entries.length, frameworks: grouped }, null, 2)
    );
    return;
  }

  if (entries.length === 0) {
    console.log();
    console.log(chalk.dim("  No Syncfusion skills installed."));
    console.log();
    console.log(
      `  Run ${chalk.cyan("cs-design skills add <framework>")} to install.`
    );
    console.log();
    return;
  }

  // Group by framework for display
  const grouped: Record<string, string[]> = {};
  for (const name of entries) {
    const framework = detectFramework(name);
    if (!grouped[framework]) grouped[framework] = [];
    grouped[framework].push(name);
  }

  console.log();
  console.log(
    `${chalk.bold("Installed Syncfusion Skills")} (${entries.length} total)`
  );
  console.log();

  for (const [framework, skills] of Object.entries(grouped)) {
    console.log(`  ${chalk.bold(framework)} (${skills.length} skills)`);
    for (const skill of skills) {
      console.log(`    ${chalk.dim(skill)}`);
    }
    console.log();
  }
}

function detectFramework(skillName: string): string {
  for (const f of getFrameworks()) {
    if (skillName.startsWith(f.prefix)) return f.name;
  }
  return "Other";
}

// ── skills remove ──

export async function skillsRemoveCommand(
  frameworkId: string
): Promise<void> {
  const framework = getFramework(frameworkId);
  if (!framework) {
    logError(`Unknown framework "${frameworkId}".`);
    console.log();
    console.log("Available frameworks:");
    for (const f of getFrameworks()) {
      console.log(`  ${chalk.cyan(f.id.padEnd(14))} ${f.name}`);
    }
    process.exit(1);
  }

  const spinner = ora(
    `Removing Syncfusion ${framework.name} skills...`
  ).start();

  try {
    const canonicalDir = getCanonicalSkillsDir();
    const symlinkTargets = getSymlinkTargets();

    // Find matching skills
    let removed = 0;

    if (fs.existsSync(canonicalDir)) {
      const entries = fs
        .readdirSync(canonicalDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith(framework.prefix));

      for (const entry of entries) {
        // Remove canonical
        fs.removeSync(path.join(canonicalDir, entry.name));

        // Remove symlinks
        for (const targetDir of symlinkTargets) {
          const linkPath = path.join(targetDir, entry.name);
          try {
            fs.removeSync(linkPath);
          } catch {
            // Skip
          }
        }

        removed++;
      }
    }

    if (removed === 0) {
      spinner.info(`No Syncfusion ${framework.name} skills found to remove.`);
    } else {
      spinner.succeed(
        `Removed ${chalk.bold(removed)} Syncfusion ${framework.name} skills`
      );
    }
    console.log();
  } catch (error) {
    spinner.fail("Removal failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
