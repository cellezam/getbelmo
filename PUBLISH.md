# Publishing @getbelmo/mcp-server

One-time setup and per-release checklist for publishing the MCP server to the
public npm registry. This repo is standalone-buildable: `npm install` then
`npm run build` produces the publishable `main.cjs` with no monorepo tooling.

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

Run from the repo root.

```bash
# 1. Verify the working tree is clean and on main
git status
git log -1 --oneline

# 2. Install deps and build a fresh artifact
npm install
npm run typecheck          # tsc --noEmit, catches type errors
npm run build              # bundles src/main.ts -> ./main.cjs (also runs on prepublishOnly)

# 3. Sanity-check what will ship
cat package.json                  # name, version, bin, license correct?
node main.cjs < /dev/null         # binary loads, exits cleanly on stdin close
npm pack --dry-run                # list every file that will be published
#   Expect: main.cjs, package.json, README.md, LICENSE

# 4. (Optional) Real tarball preview
npm pack
tar -tzf getbelmo-mcp-server-*.tgz
rm getbelmo-mcp-server-*.tgz

# 5. Publish (will prompt for OTP; prepublishOnly rebuilds main.cjs)
npm publish --access public

# 6. Smoke-test the live package
cd /tmp
npx -y @getbelmo/mcp-server@latest < /dev/null
#   Should print nothing on stdout (stdio MCP server) and exit cleanly when
#   stdin closes. Any startup crash will show on stderr.
```

## After publishing

1. **Tag the release** in git:
   ```bash
   git tag v1.1.1
   git push origin v1.1.1
   ```
2. **Announce** in Discord (the help channel).

## Bumping versions

For subsequent releases, edit `package.json` `version` and rerun the
checklist. npm will not overwrite an already-published version. Use semver:

- Patch (1.1.x): bug fix, no UX change
- Minor (1.x.0): new tool, additive change
- Major (x.0.0): breaking change to tool surface or auth flow

## What ships

Inspecting `npm pack --dry-run` should show exactly:

- `package.json`
- `main.cjs` (bundled, single-file Node entry — built by `npm run build`)
- `README.md`
- `LICENSE`

The `files` allowlist in `package.json` keeps `main.cjs` + `README.md`; npm
always includes `package.json` and `LICENSE`. Source, configs, and
`node_modules` never ship.

> **Maintainers:** the canonical source lives in the private monorepo under
> `apps/mcp-server`. This public repo is a mirror of that directory only —
> never push the monorepo or any `.env*` files here.
