# BANGEO experiments redesign patch

This branch is reserved for applying `bangeo-experiments-redesign.patch`.

The uploaded patch was checked against `main`, and the main target file blob SHAs matched the current repository state at the time of review.

Apply locally with:

```bash
git checkout main
git pull
git checkout experiments-redesign
# or: git checkout -B experiments-redesign origin/experiments-redesign
git am /path/to/bangeo-experiments-redesign.patch
pnpm install
pnpm --filter @bangeo/blog lint
pnpm --filter @bangeo/blog build
git push origin experiments-redesign
```

Expected patch scope:

- Redesign experiment launch/index flows
- Add shared WebXR runtime/preflight helpers
- Add headset QR sending support
- Update selected demo HTML entrypoints
- Add `qrcode` dependency and lockfile updates
