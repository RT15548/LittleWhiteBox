# World v2 fixture

Captured on 2026-09-19 before changing the v2 implementation at
`cccba0f4`. Its world domain and file reader match upstream
`a32c28d0518ce1e870ba0b0935a2b149438b465a`.

This is the actual `partitions.world` written by the production WorldEdit →
session commit → partition serializer path, exercised through `worldHarness`
with its in-memory storage adapter. The input was that revision's `article()`
and overview `港城在初夏恢复热闹。`. It is not a native user chat capture or an
object generated using the new model.

V2 stores `version`, `overview`, and `news`; articles contain `id`, `title`,
`summary`, and `body`. Frozen limits: 8 articles, 64 code points for IDs/titles,
120 for summaries, 800 for bodies, 320 for overview. Migration retains IDs,
titles and complete bodies, drops summaries, and writes only the current format
on the next content save.
