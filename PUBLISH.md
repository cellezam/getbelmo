# Publishing @getbelmo/mcp-server

One-time setup and per-release checklist for publishing the MCP server to the
public npm registry.

## One-time setup

1. **Create the npm scope.** Sign in to npmjs.com with the account that owns
   the `getbelmo` org (or create it). The scope must exist before the first
   publish.
2. **Verify auth locally.**
   ```bash
   npm whoami
   # Should print the account name that owns the @getbelmo scope.
   npm login    # if needed
   ```
3. **Enable 2FA** on the npm account if not already. `publishConfig` is set
   to `public`, and you'll be prompted for an OTP on publish.

## Per-release checklist

Run from the monorepo root.

```bash
# 1. Verify the working tree is clean and on main
git status
git log -1 --oneline

# 2. Build a fresh artifact
./node_modules/.bin/nx build mcp-server --skip-nx-cache

# 3. Copy README into the publish directory
#    (nx esbuild doesn't reliably copy README assets, so we do it here)
cp apps/mcp-server/README.md dist/apps/mcp-server/README.md

# 4. Sanity-check what will ship
cd dist/apps/mcp-server
cat package.json                  # name, version, bin, license correct?
node main.cjs --help 2>/dev/null || true   # binary loads
npm pack --dry-run                # list every file that will be published
#   Expect: main.cjs, package.json, README.md
#   The pnpm-lock.yaml is not in `files` so it won't ship.

# 5. (Optional) Real tarball preview
npm pack
tar -tzf getbelmo-mcp-server-*.tgz
rm getbelmo-mcp-server-*.tgz

# 6. Publish (will prompt for OTP)
npm publish --access public

# 7. Smoke-test the live package
cd /tmp
npx -y @getbelmo/mcp-server@1.1.0 < /dev/null
#   Should print nothing on stdout (stdio MCP server) and exit cleanly when
#   stdin closes. Any startup crash will show on stderr.
```

## After publishing

1. **Tag the release** in git:
   ```bash
   git tag mcp-server-v1.0.0
   git push origin mcp-server-v1.0.0
   ```
2. **Announce** in Discord (the help channel) so existing users know to
   run `auth_login` again — the auth migration means any previously stored
   Bearer-style token is no longer valid against the cookie-only backend.

## Bumping versions

For subsequent releases, edit `apps/mcp-server/package.json` `version` and
rerun the checklist. Use semver:

- Patch (1.0.x): bug fix, no UX change
- Minor (1.x.0): new tool, additive change
- Major (x.0.0): breaking change to tool surface or auth flow

## What ships

Inspecting `npm pack --dry-run` should show exactly:

- `package.json`
- `main.cjs` (bundled, single-file Node entry)
- `README.md`

No source files, no lockfile, no env files. The `files` allowlist isn't set
because the dist directory already only contains what we want to ship.
