/**
 * syncfusion-components SKILL.md — Router skill that teaches agents
 * how to install and use Syncfusion component skills on demand.
 */

export const SYNCFUSION_SKILL_MD_CONTENT = `---
name: syncfusion-components
description: "Install and use Syncfusion UI component skills for production code generation. Use when: converting HTML designs to React, Angular, Blazor, Vue, or JavaScript production code with Syncfusion components, adding data grids, charts, schedulers, forms, editors, navigation, kanban boards, or any Syncfusion UI component to a project."
argument-hint: "Framework and components, e.g. 'react grid and charts' or 'angular scheduler'"
---

# Syncfusion Component Skills

Install Syncfusion component skills on demand so AI agents can generate accurate, API-correct production code. Each component skill contains verified setup, imports, configuration, and usage patterns maintained by Syncfusion.

## When to Use

- Converting HTML screen designs (.designs/screens/) to production framework code
- Adding Syncfusion UI components (grid, chart, scheduler, etc.) to a project
- Need accurate Syncfusion API usage, imports, and configuration

## Procedure

### Step 1 — Detect the framework

Check the project for framework indicators:
- \`package.json\` with \`react\`, \`@angular/core\`, \`vue\` → web framework
- \`.csproj\` with \`Microsoft.NET.Sdk.BlazorWebAssembly\` → blazor
- \`.csproj\` with \`Microsoft.Maui\` → maui
- \`.csproj\` with WPF/WinUI/WinForms references → desktop framework

### Step 2 — Install component skills

Run \`cs-design skills add <framework>\` to install all Syncfusion component skills for that framework. This is **non-interactive** and safe for agents to run.

\`\`\`bash
# Install all skills for a framework
cs-design skills add react
cs-design skills add angular
cs-design skills add blazor
cs-design skills add vue
cs-design skills add javascript
cs-design skills add maui
cs-design skills add wpf
cs-design skills add winui
cs-design skills add winforms

# Install only specific components
cs-design skills add react --only grid,scheduler,charts

# List installed skills
cs-design skills list

# Remove skills for a framework
cs-design skills remove react
\`\`\`

### Step 3 — Read the installed component skills

After installation, component skills are available at \`~/.agents/skills/\`. Each skill has:
- \`SKILL.md\` — Setup, imports, configuration, key APIs
- \`references/\` — Detailed feature docs (loaded on demand)

Read only the skills you need for the current screen.

### Step 4 — Generate production code

Use the design tokens from [DESIGN.md](../../../.designs/DESIGN.md) for styling, and the component skill instructions for Syncfusion API usage.

## Component Catalog

### Data & Lists

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Data table / grid | syncfusion-react-grid | syncfusion-angular-grid |
| Tree grid | syncfusion-react-treegrid | syncfusion-angular-treegrid |
| Pivot table | syncfusion-react-pivot-table | syncfusion-angular-pivot-table |
| ListView | syncfusion-react-listview | syncfusion-angular-listview |
| Kanban board | syncfusion-react-kanban | syncfusion-angular-kanban |

### Charts & Visualization

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Bar/line/area chart | syncfusion-react-charts | syncfusion-angular-charts |
| Pie/donut chart | syncfusion-react-accumulation-chart | syncfusion-angular-accumulation-chart |
| 3D chart | syncfusion-react-3d-chart | syncfusion-angular-3d-chart |
| Heatmap | syncfusion-react-heatmap | syncfusion-angular-heatmap |
| Sparkline | syncfusion-react-sparkline | syncfusion-angular-sparkline |
| Maps | syncfusion-react-maps | syncfusion-angular-maps |
| Bullet chart | syncfusion-react-bullet-chart | syncfusion-angular-bullet-chart |
| Gauges | syncfusion-react-circular-gauge | syncfusion-angular-circular-gauge |

### Scheduling & Calendar

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Scheduler / calendar | syncfusion-react-scheduler | syncfusion-angular-scheduler |
| Gantt chart | syncfusion-react-gantt-chart | syncfusion-angular-gantt-chart |

### Forms & Inputs

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Text / number inputs | syncfusion-react-inputs | syncfusion-angular-inputs |
| Buttons / toggles | syncfusion-react-buttons | syncfusion-angular-buttons |
| Dropdowns / select | syncfusion-react-dropdowns | syncfusion-angular-dropdowns |
| Date/time pickers | syncfusion-react-calendars | syncfusion-angular-calendars |
| File upload | syncfusion-react-inputs | syncfusion-angular-inputs |
| Query builder | syncfusion-react-query-builder | syncfusion-angular-query-builder |

### Navigation

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Sidebar | syncfusion-react-sidebar | syncfusion-angular-sidebar |
| Tabs | syncfusion-react-tabs | syncfusion-angular-tabs |
| Toolbar | syncfusion-react-toolbar | syncfusion-angular-toolbar |
| Menu | syncfusion-react-menu | syncfusion-angular-menu |
| Breadcrumb | syncfusion-react-breadcrumb | syncfusion-angular-breadcrumb |
| TreeView | syncfusion-react-treeview | syncfusion-angular-treeview |
| Accordion | syncfusion-react-accordion | syncfusion-angular-accordion |
| Stepper | syncfusion-react-stepper | syncfusion-angular-stepper |

### Layout

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Dashboard layout | syncfusion-react-dashboard-layout | syncfusion-angular-dashboard-layout |
| Splitter | syncfusion-react-splitter | syncfusion-angular-splitter |
| Cards | syncfusion-react-cards | syncfusion-angular-cards |

### Editors

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Rich text editor | syncfusion-react-rich-text-editor | syncfusion-angular-rich-text-editor |
| Image editor | syncfusion-react-image-editor | syncfusion-angular-image-editor |
| Diagram | syncfusion-react-diagram | syncfusion-angular-diagram |

### Notifications & Feedback

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Dialog / modal | syncfusion-react-popups | syncfusion-angular-popups |
| Toast / alerts | syncfusion-react-notifications | syncfusion-angular-notifications |
| Progress bar | syncfusion-react-progress-bar | syncfusion-angular-progress-bar |

### AI Components

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| AI AssistView | syncfusion-react-ai-assistview | syncfusion-angular-ai-assistview |
| Chat UI | syncfusion-react-chat-ui | syncfusion-angular-chat-ui |

### Always Install (Base Skills)

These should always be installed alongside component skills:

| Skill | Purpose |
|-------|---------|
| \`syncfusion-<fw>-common\` | Shared setup, data manager, service patterns |
| \`syncfusion-<fw>-themes\` | Theme CSS, styling, design token mapping |
| \`syncfusion-<fw>-license\` | License key registration |

## Skill Naming Convention

All Syncfusion skills follow the pattern: \`syncfusion-<framework>-<component>\`

Replace \`<framework>\` with: \`react\`, \`angular\`, \`blazor\`, \`vue\`, \`javascript\`, \`maui\`, \`wpf\`, \`winui\`, \`winforms\`
`;
