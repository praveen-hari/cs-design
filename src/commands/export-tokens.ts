/**
 * `cs-design export tokens` — CLI wrapper over SDK exportTokens().
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { exportTokens } from "../sdk/exporter.js";
import type { TokenFormat } from "../sdk/types.js";
import { DESIGN_MD } from "../constants.js";
import { requireProject, logError } from "../utils.js";

export interface ExportTokensOptions {
  format: TokenFormat;
  out?: string;
}

export async function exportTokensCommand(options: ExportTokensOptions): Promise<void> {
  const designsDir = await requireProject();
  const designPath = path.join(designsDir, DESIGN_MD);
  const content = await fs.readFile(designPath, "utf-8");

  const spinner = ora(`Exporting tokens as ${options.format}...`).start();

  const result = exportTokens(content, options.format);

  if (!result.ok) {
    spinner.fail("Export failed.");
    logError(result.error);
    process.exit(1);
  }

  try {
    const outputPath = options.out || path.join(designsDir, `tokens.${result.data.extension}`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, result.data.content, "utf-8");
    spinner.succeed(`Tokens exported to ${chalk.cyan(outputPath)}`);
  } catch (error) {
    spinner.fail("Export failed.");
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
