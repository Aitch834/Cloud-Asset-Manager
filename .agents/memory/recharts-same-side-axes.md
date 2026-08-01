---
name: Recharts same-orientation Y axes
description: Multiple YAxis components on the same side do NOT overlap — Recharts offsets them by width automatically; verify with SSR render if challenged.
---

Multiple `YAxis` components with the same `orientation` in one Recharts chart are stacked side by side automatically — each axis (line, ticks, label) gets its own x offset equal to the accumulated widths.

**Why:** A completion code review wrongly rejected a three-axis chart assuming same-side axes render at the same coordinate. SSR proof: with two right axes of width 42 in a 640px chart, axis lines rendered at x=514 and x=556.

**How to apply:** When adding a second axis to the same side, just add the `YAxis` with its own `yAxisId` and `width`. To prove non-overlap cheaply, `renderToStaticMarkup` the chart (fixed width/height `BarChart`, no ResponsiveContainer) with node from the artifact dir and grep the yAxis groups' `x1` positions.
