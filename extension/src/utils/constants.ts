/** View IDs */
export const VIEW_ID = "csDesign.explorer";

/** Command IDs */
export const CMD = {
  openWelcome: "csDesign.openWelcome",
  openTokenEditor: "csDesign.openTokenEditor",
  openDesignMd: "csDesign.openDesignMd",
  validate: "csDesign.validate",
  exportTokens: "csDesign.exportTokens",
  previewScreen: "csDesign.previewScreen",
  newScreen: "csDesign.newScreen",
  switchSystem: "csDesign.switchSystem",
  refresh: "csDesign.refresh",
  createDesignSystem: "csDesign.createDesignSystem",
} as const;

/** Context keys */
export const CTX = {
  projectExists: "csDesign.projectExists",
  wizardActive: "csDesign.wizardActive",
} as const;

/** File paths relative to workspace */
export const PATHS = {
  designsDir: ".designs",
  designMd: ".designs/DESIGN.md",
  tokensCss: ".designs/tokens.css",
  projectJson: ".designs/project.json",
  screensDir: ".designs/screens",
} as const;
