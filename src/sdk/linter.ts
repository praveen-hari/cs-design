/**
 * SDK Linter — Deep lint DESIGN.md using @google/design.md.
 *
 * Wraps Google's spec-compliant linter into a pure function that
 * takes a string and returns a typed result. No I/O, no side effects.
 */

import { lint as googleLint } from "@google/design.md/linter";
import type { LintReport as GoogleLintReport } from "@google/design.md/linter";
import type {
  LintReport,
  LintFinding,
  LintSummary,
  DesignSystemInfo,
  Result,
} from "./types.js";

/**
 * Deep lint a DESIGN.md string using the @google/design.md linter.
 *
 * Runs 9+ lint rules including:
 * - broken-ref: Unresolved {token.references}
 * - contrast-ratio: WCAG AA contrast failures
 * - orphaned-tokens: Unused color tokens
 * - missing-primary: No primary color defined
 * - section-order: Sections out of canonical order
 * - unknown-key: Likely YAML key typos
 * - And more...
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing the lint report
 *
 * @example
 * ```ts
 * import { lint } from "@syncfusion/cs-design/sdk";
 *
 * const result = lint(designMdContent);
 * if (result.ok) {
 *   console.log(result.data.summary);          // { errors: 0, warnings: 2, infos: 1 }
 *   console.log(result.data.findings);          // LintFinding[]
 *   console.log(result.data.designSystem.name); // "Modern Minimal"
 * }
 * ```
 */
export function lint(content: string): Result<LintReport> {
  try {
    const report: GoogleLintReport = googleLint(content);

    // Map Google findings to our SDK type
    const findings: LintFinding[] = report.findings.map((f) => ({
      severity: f.severity as LintFinding["severity"],
      message: f.message,
      path: (f as any).path,
    }));

    const summary: LintSummary = {
      errors: report.summary.errors,
      warnings: report.summary.warnings,
      infos: report.summary.infos,
    };

    const ds = report.designSystem;
    const designSystem: DesignSystemInfo = {
      name: ds.name ?? "",
      colors: ds.colors.size,
      typography: ds.typography.size,
      rounded: ds.rounded.size,
      spacing: ds.spacing.size,
      components: ds.components.size,
      sections: report.sections,
    };

    return {
      ok: true,
      data: { findings, summary, designSystem, sections: report.sections },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lint failed: ${message}` };
  }
}

/**
 * Access the raw Google LintReport for advanced usage.
 *
 * Unlike `lint()`, this returns the full Google report object including
 * the resolved DesignSystemState with Maps, Tailwind config, etc.
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing the raw Google LintReport
 */
export function lintRaw(content: string): Result<GoogleLintReport> {
  try {
    return { ok: true, data: googleLint(content) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lint failed: ${message}` };
  }
}
