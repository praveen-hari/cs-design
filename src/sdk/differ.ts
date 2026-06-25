/**
 * SDK Differ — Compare two DESIGN.md files for token-level changes.
 *
 * Pure function: takes two strings, returns a typed diff result.
 * No I/O, no side effects.
 */

import { lint as googleLint } from "@google/design.md/linter";
import type { ComponentDef } from "@google/design.md/linter";
import type { TokenDiff, DiffResult, Result } from "./types.js";

/**
 * Compare two Maps and return added, removed, and modified keys.
 */
function diffMaps<V>(before: Map<string, V>, after: Map<string, V>): TokenDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  for (const key of after.keys()) {
    if (!before.has(key)) {
      added.push(key);
    } else {
      const bVal = JSON.stringify(before.get(key));
      const aVal = JSON.stringify(after.get(key));
      if (bVal !== aVal) {
        modified.push(key);
      }
    }
  }

  for (const key of before.keys()) {
    if (!after.has(key)) {
      removed.push(key);
    }
  }

  return { added, removed, modified };
}

/**
 * Serialize component definitions to a comparable Map.
 */
function serializeComponents(
  components: Map<string, ComponentDef>,
): Map<string, Record<string, unknown>> {
  const result = new Map<string, Record<string, unknown>>();
  for (const [name, comp] of components) {
    result.set(name, Object.fromEntries(comp.properties));
  }
  return result;
}

/**
 * Compare two DESIGN.md strings and detect token-level changes.
 *
 * Parses both files using the Google linter, then compares the resolved
 * design system models to find added, removed, and modified tokens.
 * Also detects regressions (new errors or warnings in the "after" file).
 *
 * @param beforeContent - Raw content of the "before" DESIGN.md
 * @param afterContent  - Raw content of the "after" DESIGN.md
 * @returns Result containing the diff report
 *
 * @example
 * ```ts
 * import { diff } from "@syncfusion/cs-design/sdk";
 *
 * const result = diff(oldDesignMd, newDesignMd);
 * if (result.ok) {
 *   console.log(result.data.tokens.colors.modified); // ["primary", "accent"]
 *   console.log(result.data.regression);              // false
 * }
 * ```
 */
export function diff(beforeContent: string, afterContent: string): Result<DiffResult> {
  try {
    const beforeReport = googleLint(beforeContent);
    const afterReport = googleLint(afterContent);

    const result: DiffResult = {
      tokens: {
        colors: diffMaps(beforeReport.designSystem.colors, afterReport.designSystem.colors),
        typography: diffMaps(beforeReport.designSystem.typography, afterReport.designSystem.typography),
        rounded: diffMaps(beforeReport.designSystem.rounded, afterReport.designSystem.rounded),
        spacing: diffMaps(beforeReport.designSystem.spacing, afterReport.designSystem.spacing),
        components: diffMaps(
          serializeComponents(beforeReport.designSystem.components),
          serializeComponents(afterReport.designSystem.components),
        ),
      },
      findings: {
        before: beforeReport.summary,
        after: afterReport.summary,
        delta: {
          errors: afterReport.summary.errors - beforeReport.summary.errors,
          warnings: afterReport.summary.warnings - beforeReport.summary.warnings,
        },
      },
      regression:
        afterReport.summary.errors > beforeReport.summary.errors ||
        afterReport.summary.warnings > beforeReport.summary.warnings,
    };

    return { ok: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Diff failed: ${message}` };
  }
}
