# StaffWare 2.0 — Republic Electric West

A static **demo** of StaffWare, the system is used for job costing, billing, inventory, purchasing, estimating, plans and payroll.

> **Demo status:** this preview is **not connected** to Backend. All figures are sample data. Forms, saves and actions are no-ops and change nothing.

## What's in the demo

| Area | What you can do |
| --- | --- |
| **Switchboard** | Needs-attention tasks with one-click resolve, pinned and recent items, module directory |
| **Management, Accounts receivable, Inventory control, Purchasing, Estimating, Plan management, Payroll** | Set a working context (division and filters), then run reports, open forms and trigger actions |
| **Master assemblies** | Group and type browser with expandable assembly items |
| **Search (⌘K / Ctrl+K)** | Jump to any module, report, form or action |
| **Themes** | Light and dark; responsive down to phone width |

How it differs from the legacy screens:
- Filters live in a context bar and drawer instead of a column of lettered boxes.
- Each module is split into **Reports**, **Forms** and **Actions** tabs, with category pills and search.
- A report that needs a missing filter asks for only that filter when you run it.
- Actions describe what they do and confirm before running. Duplicate actions use a From → To layout.

## Repository layout

```
code/            The static site (this is what gets published)
  index.html
  css/styles.css
  js/data.js     Modules, filters, buttons and sample data
  js/app.js      Routing, filters, dialogs, reports
  assets/        Logo
.github/workflows/deploy.yml   GitHub Pages deployment
```

Deep links: `#/home`, `#/m/PM`, `#/m/PM?tab=action` (tabs: `overview`, `report`, `form`, `action`), `#/assemblies`.

To make `code/` the repo root instead, change `path: 'code'` to `path: '.'` in the workflow.

## Updating the demo

- **Add or change a screen:** edit the module definitions in `code/js/data.js`. Each button is `[label, requiredFilters, options]`; the letters list the filters the button needs.
- **Sample report data:** also in `data.js`.
- **Behaviour and layout:** `code/js/app.js` and `code/css/styles.css`.
