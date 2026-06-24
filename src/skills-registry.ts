/**
 * Syncfusion skills registry — framework → repo mapping and install targets.
 */

import os from "node:os";
import path from "node:path";

// ── Framework registry ──

export interface FrameworkEntry {
  id: string;
  name: string;
  repo: string;
  prefix: string;
}

const FRAMEWORKS: FrameworkEntry[] = [
  {
    id: "react",
    name: "React",
    repo: "syncfusion/react-ui-components-skills",
    prefix: "syncfusion-react-",
  },
  {
    id: "angular",
    name: "Angular",
    repo: "syncfusion/angular-ui-components-skills",
    prefix: "syncfusion-angular-",
  },
  {
    id: "blazor",
    name: "Blazor",
    repo: "syncfusion/blazor-ui-components-skills",
    prefix: "syncfusion-blazor-",
  },
  {
    id: "javascript",
    name: "JavaScript",
    repo: "syncfusion/javascript-ui-controls-skills",
    prefix: "syncfusion-javascript-",
  },
  {
    id: "vue",
    name: "Vue",
    repo: "syncfusion/vue-ui-components-skills",
    prefix: "syncfusion-vue-",
  },
  {
    id: "maui",
    name: ".NET MAUI",
    repo: "syncfusion/maui-ui-components-skills",
    prefix: "syncfusion-maui-",
  },
  {
    id: "wpf",
    name: "WPF",
    repo: "syncfusion/wpf-ui-components-skills",
    prefix: "syncfusion-wpf-",
  },
  {
    id: "winui",
    name: "WinUI",
    repo: "syncfusion/winui-ui-components-skills",
    prefix: "syncfusion-winui-",
  },
  {
    id: "winforms",
    name: "WinForms",
    repo: "syncfusion/winforms-ui-components-skills",
    prefix: "syncfusion-winforms-",
  },
];

export function getFrameworks(): FrameworkEntry[] {
  return FRAMEWORKS;
}

export function getFramework(id: string): FrameworkEntry | undefined {
  return FRAMEWORKS.find((f) => f.id === id);
}

export function getFrameworkIds(): string[] {
  return FRAMEWORKS.map((f) => f.id);
}

// ── Install targets ──

/**
 * Agent directories where skills are symlinked.
 * The canonical location is ~/.agents/skills/ — all others are symlinks to it.
 */
export function getCanonicalSkillsDir(): string {
  return path.join(os.homedir(), ".agents", "skills");
}

/**
 * Agent directories that get symlinks pointing to the canonical location.
 */
export function getSymlinkTargets(): string[] {
  const home = os.homedir();
  return [
    path.join(home, ".codestudio", "skills"),
    path.join(home, ".claude", "skills"),
    path.join(home, ".copilot", "skills"),
    path.join(home, ".continue", "skills"),
    path.join(home, ".kiro", "skills"),
    path.join(home, ".codeium", "windsurf", "skills"),
  ];
}

/**
 * Get the GitHub clone URL for a framework.
 */
export function getRepoUrl(framework: FrameworkEntry): string {
  return `https://github.com/${framework.repo}.git`;
}
