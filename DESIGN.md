# Taskline design system

Product: a local project dependency workspace for a student hackathon.
Skills applied: ui-ux-pro-max and ui-styling.
Direction: flat productivity dashboard with drill-down task details. The dependency map is the defining interaction; avoid decorative hero sections and marketing funnels.

Palette: ink #202735, muted #647087, canvas #f7f8fc, white #ffffff, indigo #4f46e5, border #e5e8f0. Amber indicates blocked work, blue in-progress work, green completion; always pair colour with text and an icon.
Typography: Segoe UI / Helvetica Neue / Arial. Use a compact information hierarchy, larger readable task titles and a 29px page heading. Use 16px form controls on mobile.
Layout: fixed desktop workspace sidebar, top breadcrumb, task summary, task board/list/map, and supporting blocker/activity panels. Collapse sidebar into labelled horizontal navigation on mobile. Board columns reflow rather than forcing page-level horizontal scrolling.
Components: reusable shadcn-style Button (CVA/Slot) and Dialog (Radix primitives) with Tailwind utilities and semantic styling tokens. Dialogs trap focus, close with Escape, and offer visible close controls.
Interaction: changes save only after successful API responses. Show explicit validation errors, loading states, destructive confirmation, and non-disruptive success notices. Provide forms as an alternative to dragging dependency connections. Impact previews do not mutate schedules.
