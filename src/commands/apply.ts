/**
 * `cs-design apply` — CLI wrapper. Re-exports tokens.css using SDK generateCss().
 */

import fs from "fs-extra";
import path from "node:path";
import ora from "ora";
import { SCREENS_DIR, DESIGN_MD } from "../constants.js";
import { requireProject, logSuccess, logError, logInfo } from "../utils.js";
import { parseDesignMd } from "../sdk/parser.js";
import { generateCss } from "../sdk/exporter.js";

export async function applyCommand(): Promise<void> {
  const designsDir = await requireProject();
  const designPath = path.join(designsDir, DESIGN_MD);
  const content = await fs.readFile(designPath, "utf-8");

  const parsed = parseDesignMd(content);
  if (!parsed.ok) {
    logError(`Could not parse ${DESIGN_MD}: ${parsed.error}`);
    process.exit(1);
  }

  const spinner = ora("Applying design system...").start();

  try {
    // 1. Generate and write tokens.css
    spinner.text = "Exporting tokens.css...";
    const css = generateCss(parsed.data.yaml);
    const tokensPath = path.join(designsDir, "tokens.css");
    await fs.writeFile(tokensPath, css, "utf-8");

    // 2. Count screens
    const screensDir = path.join(designsDir, SCREENS_DIR);
    let screenCount = 0;
    if (await fs.pathExists(screensDir)) {
      const files = await fs.readdir(screensDir);
      screenCount = files.filter((f) => f.endsWith(".html")).length;
    }

    spinner.succeed("Design system applied!");
    console.log();
    logSuccess(`tokens.css exported → ${tokensPath}`);

    if (screenCount > 0) {
      logSuccess(`${screenCount} screen${screenCount !== 1 ? "s" : ""} will use the updated tokens via <link href="../tokens.css" />`);
    } else {
      logInfo("No screens found yet. Generate screens using the cs-design skill.");
    }
    console.log();
  } catch (error) {
    spinner.fail("Apply failed.");
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
