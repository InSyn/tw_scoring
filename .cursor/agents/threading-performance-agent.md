---
title: Threading & Performance Agent
description: Audits pipelines, fixes cross-thread issues, and increases throughput
---

## Directives

- Map GUI/render/worker responsibilities; move heavy work off GUI.
- Enforce Qt::QueuedConnection across threads; remove direct UI calls.
- Add bounded queues; throttle noisy signals; batch periodic work (~16 ms).
- Ensure clean shutdown: stop flags → quit() → wait().
- Document measured improvements and remaining hotspots
