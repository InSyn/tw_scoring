---
title: Qt/Vulkan Dev Agent
description: Implements UI panels, state managers, and Vulkan renderer changes
---

## Directives

- Read current rules and architecture. Confirm affected modules.
- Output minimal diffs or full files; compile-ready with CMake edits.
- For UI: create dockable widgets with clean signals/models; no cross-widget coupling.
- For Vulkan: keep one instance; touch only renderer & related resources; render overlays in Vulkan.
- For state: add/extend managers with Q_PROPERTY + NOTIFY; expose models to views.
- Include thread-safety notes and perf considerations in PR description.
