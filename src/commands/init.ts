/**
 * `cs-design init` command — Initialize a new design project.
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import type { ProjectJson } from "../types.js";
import {
  DESIGNS_DIR,
  DESIGN_MD,
  PROJECT_JSON,
  SKILL_MD,
  SCREENS_DIR,
  SKILLS_DIR,
  SKILL_FOLDER_NAME,
  SYNCFUSION_SKILL_FOLDER_NAME,
  CREATE_DESIGN_SKILL_FOLDER_NAME,
  DEFAULT_SYSTEM,
  getDesignsDir,
  getSkillDir,
  getSyncfusionSkillDir,
  getCreateDesignSkillDir,
} from "../constants.js";
import { resolveSystem } from "../systems/index.js";
import { SKILL_MD_CONTENT } from "../templates/skill.js";
import { SYNCFUSION_SKILL_MD_CONTENT } from "../templates/syncfusion-skill.js";
import { CREATE_DESIGN_SKILL_MD_CONTENT } from "../templates/create-design-skill.js";
import { logSuccess, logError } from "../utils.js";

export interface InitOptions {
  system: string;
  force: boolean;
}

export async function initCommand(
  projectName: string,
  options: InitOptions
): Promise<void> {
  const designsDir = getDesignsDir();
  const systemId = options.system || DEFAULT_SYSTEM;

  // Check if .designs/ already exists
  if ((await fs.pathExists(designsDir)) && !options.force) {
    logError(
      `${DESIGNS_DIR}/ already exists. Use ${chalk.cyan("--force")} to overwrite.`
    );
    process.exit(1);
  }

  const spinner = ora("Initializing design project...").start();

  try {
    // Resolve the design system
    const systemContent = await resolveSystem(systemId);
    if (!systemContent) {
      spinner.fail(`Design system "${systemId}" not found.`);
      console.log();
      console.log("Available systems:");
      console.log(`  ${chalk.cyan("modern-minimal")}     Clean, product-oriented`);
      console.log(`  ${chalk.cyan("corporate-clean")}    Professional, trustworthy`);
      console.log(`  ${chalk.cyan("bold-creative")}      Vibrant, expressive`);
      console.log();
      console.log(
        `Run ${chalk.cyan("cs-design systems list")} to see all available systems.`
      );
      process.exit(1);
    }

    // Create directory structure
    spinner.text = "Creating directory structure...";
    await fs.ensureDir(designsDir);
    await fs.ensureDir(path.join(designsDir, SCREENS_DIR));

    // Write DESIGN.md
    spinner.text = "Writing DESIGN.md...";
    await fs.writeFile(path.join(designsDir, DESIGN_MD), systemContent, "utf-8");

    // Write project.json
    spinner.text = "Writing project.json...";
    const projectJson: ProjectJson = {
      name: projectName,
      system: systemId,
      createdAt: new Date().toISOString(),
      screens: {},
    };
    await fs.writeJson(path.join(designsDir, PROJECT_JSON), projectJson, {
      spaces: 2,
    });

    // Write skills into standard Agent Skills folder structure
    spinner.text = "Writing skills...";
    const skillDir = getSkillDir();
    await fs.ensureDir(skillDir);
    await fs.writeFile(
      path.join(skillDir, SKILL_MD),
      SKILL_MD_CONTENT,
      "utf-8"
    );

    // Write Syncfusion component router skill
    const sfSkillDir = getSyncfusionSkillDir();
    await fs.ensureDir(sfSkillDir);
    await fs.writeFile(
      path.join(sfSkillDir, SKILL_MD),
      SYNCFUSION_SKILL_MD_CONTENT,
      "utf-8"
    );

    // Write create-design-system skill
    const createDesignSkillDir = getCreateDesignSkillDir();
    await fs.ensureDir(createDesignSkillDir);
    await fs.writeFile(
      path.join(createDesignSkillDir, SKILL_MD),
      CREATE_DESIGN_SKILL_MD_CONTENT,
      "utf-8"
    );

    spinner.succeed("Design project initialized!");
    console.log();
    console.log(`  ${chalk.bold("Project:")}  ${projectName}`);
    console.log(`  ${chalk.bold("System:")}   ${systemId}`);
    console.log(`  ${chalk.bold("Location:")} ${chalk.dim(designsDir)}`);
    console.log();
    console.log("  Created:");
    logSuccess(`${DESIGNS_DIR}/${DESIGN_MD}`);
    logSuccess(`${DESIGNS_DIR}/${PROJECT_JSON}`);
    logSuccess(`${SKILLS_DIR}/${SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${SKILLS_DIR}/${SYNCFUSION_SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${SKILLS_DIR}/${CREATE_DESIGN_SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${DESIGNS_DIR}/${SCREENS_DIR}/`);
    console.log();
    console.log(
      `  ${chalk.dim("Your AI agent can now read SKILL.md and DESIGN.md to generate screens.")}`
    );
  } catch (error) {
    spinner.fail("Failed to initialize project.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
