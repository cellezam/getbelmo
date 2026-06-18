# @getbelmo/mcp-server

Model Context Protocol server for [Belmo](https://belmo.io). Connect
your AI coding tool to your Belmo account to sign in, manage workspaces,
deploy GitHub repositories, and inspect deployment status — all through tool
calls.

## Install

The MCP server is published as a Node CLI:

```bash
npx -y @getbelmo/mcp-server
```

### Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "belmo": {
      "command": "npx",
      "args": ["-y", "@getbelmo/mcp-server"]
    }
  }
}
```

### Cursor / Windsurf / other MCP clients

Use the same `command` + `args` shape in the client's MCP config.

## Sign in

The MCP server stores credentials encrypted at `~/.hostingguru/credentials.json`.

### Email + password

In your AI tool, run the `auth_login` tool. The server opens a local URL like
`http://localhost:54321/login`. Open it in your browser, enter your email and
password, and submit. The form posts to a one-shot endpoint on the same
local port — credentials never pass through the AI tool, and the form itself
is bound to a single-use nonce so no other process can race the submission.

If your email is unknown, an account is created and you'll receive a
verification email — same flow as `dashboard.belmo.io`.

### Google or GitHub (OAuth)

OAuth providers redirect to the dashboard, not to a CLI, so:

1. Sign in at `https://dashboard.belmo.io/auth` with Google or GitHub.
2. Open DevTools → Application → Cookies → copy the value of the `token`
   cookie.
3. In your AI tool, run `auth_token` and paste it.

### Sign out

Run `auth_logout`. The local credentials file is removed and the backend
cookie is invalidated.

## Tools

| Tool | What it does |
| --- | --- |
| `auth_login` | Email/password sign-in via local browser page |
| `auth_signup` | Create a new account via local browser page |
| `auth_token` | Authenticate with a session token (for OAuth users) |
| `auth_status` | Show authenticated state + selected workspace |
| `auth_logout` | Sign out locally and on the backend |
| `list_workspaces` / `select_workspace` / `create_workspace` | Workspace selection and creation |
| `list_projects` / `create_project` | Project management |
| `deploy` / `list_deployments` / `get_deployment` | Create and inspect deployments |
| `redeploy` / `rollback_deployment` / `stop_deployment` / `start_deployment` | Deployment lifecycle |
| `get_logs` / `list_builds` / `get_build_logs` | Logs and build history |
| `list_env_vars` / `set_env_vars` / `delete_env_var` | Environment variables |
| `connect_github` / `list_repositories` / `list_branches` | GitHub integration |
| `attach_domain` / `verify_domain` | Custom domains |
| `get_subscription` | Billing status |
| `setup_gtm_server` / `list_gtm_servers` / `get_gtm_server` | GTM server-side containers |
| `redeploy_gtm_server` / `update_gtm_container_config` / `delete_gtm_server` | GTM lifecycle |
| `project_link` / `project_status` / `env_pull` / `logs_fetch` | Link a local repo to a service |

## Security

- All traffic to the API uses HTTPS to `backend.belmo.io`.
- The session JWT is sent via `Cookie: token=…` (matches the dashboard's
  cookie-only auth).
- Local sign-in helper binds to `127.0.0.1` only on an ephemeral port and
  shuts down after 5 minutes or after first use.
- A random per-session nonce binds the `/submit` POST to the served login
  page, so other local processes can't hijack the credential submission.
- Credentials at rest are AES-256-GCM encrypted with a key derived from
  hostname + username + homedir.

## Development

This repo is standalone — no monorepo tooling required.

```bash
npm install      # esbuild + typescript (dev), plus the 3 runtime deps
npm run typecheck # tsc --noEmit
npm run build     # bundles src/main.ts -> ./main.cjs (deps stay external)
node main.cjs     # run the built server over stdio
```

`npm run build` produces a single-file CJS entry with a node shebang; the
three runtime dependencies are left external and installed by npm when users
run the package. Publishing is covered in `PUBLISH.md`.

## License

MIT — see [LICENSE](LICENSE).
