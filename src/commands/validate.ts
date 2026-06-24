/**
 * `cs-design validate` command — Validate DESIGN.md against the specification.
 */

import chalk from "chalk";
import type { ValidationResult, ValidationReport, DesignYaml } from "../types.js";
import { DESIGN_MD, CANONICAL_SECTIONS } from "../constants.js";
import {
  requireProject,
  readProjectDesignMd,
  isValidHexColor,
  extractMarkdownSections,
  logSuccess,
  logWarning,
  logError,
} from "../utils.js";

function check(
  name: string,
  severity: "error" | "warning",
  passed: boolean,
  message: string
): ValidationResult {
  return { check: name, severity, passed, message };
}

function validateYaml(yamlData: DesignYaml): ValidationResult[] {
  const results: ValidationResult[] = [];

  // name field
  results.push(
    check(
      "name field",
      "error",
      typeof yamlData.name === "string" && yamlData.name.length > 0,
      yamlData.name ? `name: "${yamlData.name}"` : "name field is missing or empty"
    )
  );

  // colors section
  const hasColors =
    yamlData.colors && typeof yamlData.colors === "object" && Object.keys(yamlData.colors).length > 0;
  results.push(
    check(
      "colors section",
      "error",
      !!hasColors,
      hasColors
        ? `colors: ${Object.keys(yamlData.colors).length} tokens defined`
        : "colors section is missing or empty"
    )
  );

  // Validate individual color values
  if (hasColors) {
    for (const [key, value] of Object.entries(yamlData.colors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          check(
            `color "${key}"`,
            "error",
            false,
            `Invalid hex color: "${value}" (expected #RRGGBB)`
          )
        );
      }
    }
  }

  // typography section
  const hasTypography =
    yamlData.typography &&
    typeof yamlData.typography === "object" &&
    Object.keys(yamlData.typography).length > 0;
  results.push(
    check(
      "typography section",
      "error",
      !!hasTypography,
      hasTypography
        ? `typography: ${Object.keys(yamlData.typography).length} levels defined`
        : "typography section is missing or empty"
    )
  );

  // Validate typography entries
  if (hasTypography) {
    for (const [key, entry] of Object.entries(yamlData.typography)) {
      if (!entry.fontFamily) {
        results.push(
          check(
            `typography "${key}" fontFamily`,
            "error",
            false,
            `typography.${key} is missing fontFamily`
          )
        );
      }
      if (!entry.fontSize) {
        results.push(
          check(
            `typography "${key}" fontSize`,
            "error",
            false,
            `typography.${key} is missing fontSize`
          )
        );
      }
    }
  }

  // spacing section (recommended)
  const spacingKeys = yamlData.spacing ? Object.keys(yamlData.spacing) : [];
  const hasSpacing = spacingKeys.length > 0;
  results.push(
    check(
      "spacing section",
      "warning",
      hasSpacing,
      hasSpacing
        ? `spacing: ${spacingKeys.length} levels defined`
        : "spacing section not defined (recommended)"
    )
  );

  // rounded section (recommended)
  const roundedKeys = yamlData.rounded ? Object.keys(yamlData.rounded) : [];
  const hasRounded = roundedKeys.length > 0;
  results.push(
    check(
      "rounded section",
      "warning",
      hasRounded,
      hasRounded
        ? `rounded: ${roundedKeys.length} levels defined`
        : "rounded section not defined (recommended)"
    )
  );

  // components section (recommended)
  const componentKeys = yamlData.components ? Object.keys(yamlData.components) : [];
  const hasComponents = componentKeys.length > 0;
  results.push(
    check(
      "components section",
      "warning",
      hasComponents,
      hasComponents
        ? `components: ${componentKeys.length} defined`
        : "components section not defined (recommended)"
    )
  );

  return results;
}

function validateMarkdown(markdown: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const sections = extractMarkdownSections(markdown);

  // Check for duplicate sections
  const seen = new Set<string>();
  for (const section of sections) {
    if (seen.has(section)) {
      results.push(
        check(
          `duplicate section "${section}"`,
          "error",
          false,
          `Duplicate section heading: "## ${section}"`
        )
      );
    }
    seen.add(section);
  }

  // Check canonical sections
  const presentCount = CANONICAL_SECTIONS.filter((s) => sections.includes(s)).length;
  for (const section of CANONICAL_SECTIONS) {
    results.push(
      check(
        `section "${section}"`,
        "warning",
        sections.includes(section),
        sections.includes(section)
          ? `"## ${section}" present`
          : `"## ${section}" not found (recommended)`
      )
    );
  }

  results.push(
    check(
      "markdown sections",
      "warning",
      presentCount >= 4,
      `Markdown sections: ${presentCount}/${CANONICAL_SECTIONS.length} present`
    )
  );

  return results;
}

export async function validateCommand(): Promise<void> {
  const designsDir = await requireProject();
  const parsed = await readProjectDesignMd(designsDir);

  if (!parsed) {
    logError(
      `Could not parse ${DESIGN_MD}. Ensure it has valid YAML front matter.`
    );
    process.exit(1);
  }

  const results: ValidationResult[] = [];

  // YAML front matter exists
  results.push(
    check("YAML front matter", "error", true, "valid")
  );

  // Validate YAML content
  results.push(...validateYaml(parsed.yaml));

  // Validate markdown content
  results.push(...validateMarkdown(parsed.markdown));

  // Print results
  console.log();
  for (const r of results) {
    if (r.passed) {
      logSuccess(`${r.check}: ${r.message}`);
    } else if (r.severity === "error") {
      logError(`${r.check}: ${r.message}`);
    } else {
      logWarning(`${r.check}: ${r.message}`);
    }
  }

  // Summary
  const report: ValidationReport = {
    results,
    valid: results.every((r) => r.passed || r.severity === "warning"),
    errorCount: results.filter((r) => !r.passed && r.severity === "error").length,
    warningCount: results.filter((r) => !r.passed && r.severity === "warning").length,
  };

  console.log();
  if (report.valid) {
    const suffix =
      report.warningCount > 0
        ? ` (${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`
        : "";
    console.log(chalk.green.bold(`Result: VALID${suffix}`));
  } else {
    console.log(
      chalk.red.bold(
        `Result: INVALID (${report.errorCount} error${report.errorCount > 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`
      )
    );
  }

  process.exit(report.valid ? 0 : 1);
}
