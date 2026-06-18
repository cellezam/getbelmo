import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as workspacesApi from '../api/workspaces';
import * as authApi from '../api/auth';
import { session } from '../state/session';
import { saveCredentials, clearCredentials } from '../state/credentials';
import { resetClient } from '../api/client';
import { createBrowserAuthSession, BrowserAuthSession } from '../auth/browser-auth';
import { formatError, toolResponse, toolJson } from '../utils/error-formatter';

const DASHBOARD_URL = 'https://dashboard.belmo.io';
let activeAuthSession: BrowserAuthSession | null = null;

async function autoSelectWorkspace() {
  try {
    const workspaces = await workspacesApi.listWorkspaces();
    if (Array.isArray(workspaces) && workspaces.length === 1) {
      session.setWorkspace(workspaces[0].id);
    }
  } catch {
    // Non-fatal
  }
}

export function registerAuthTools(server: McpServer) {
  server.tool(
    'auth_login',
    'Sign in to Belmo. Opens a browser window for secure login — credentials never pass through the AI tool. New emails create a fresh account automatically (matches dashboard.belmo.io).',
    {},
    async () => {
      try {
        if (activeAuthSession) {
          activeAuthSession.close();
          activeAuthSession = null;
        }

        const authSession = await createBrowserAuthSession(session.apiUrl);
        activeAuthSession = authSession;

        // URL is returned immediately so the assistant can show it; the
        // token resolves asynchronously when the user submits the form.
        authSession.waitForToken().then(async ({ token }) => {
          session.setAuth(token);
          resetClient();
          await autoSelectWorkspace();
          saveCredentials();
          activeAuthSession = null;
        }).catch(() => {
          activeAuthSession = null;
        });

        return toolResponse(
          `Open this URL in your browser to sign in:\n\n${authSession.url}\n\n` +
          'Already on the dashboard? Run auth_status to confirm once you have signed in here.\n' +
          'Using Google or GitHub OAuth? Use auth_token with a session token copied from the dashboard.',
        );
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'auth_token',
    `Authenticate with an existing session token. Use this if you signed in to ${DASHBOARD_URL} via Google or GitHub — copy the value of the \`token\` cookie from your browser's devtools and paste it here.`,
    { token: z.string().min(1) },
    async ({ token }) => {
      try {
        session.setAuth(token);
        resetClient();
        await autoSelectWorkspace();
        saveCredentials();
        const wsInfo = session.workspaceId
          ? `Workspace auto-selected: ${session.workspaceId}`
          : 'No workspace selected yet. Use list_workspaces and select_workspace.';
        return toolResponse(`Authenticated successfully.\n${wsInfo}`);
      } catch (error) {
        return toolResponse(formatError(error));
      }
    }
  );

  server.tool(
    'auth_status',
    'Check current authentication state and selected workspace.',
    {},
    async () => {
      if (!session.isAuthenticated()) {
        return toolResponse('Not authenticated. Use auth_login to sign in via browser.');
      }
      return toolJson({
        authenticated: true,
        apiUrl: session.apiUrl,
        workspaceId: session.workspaceId || 'none — use select_workspace',
      }, 'Current session:');
    }
  );

  server.tool(
    'auth_logout',
    'Sign out: clears the local session and invalidates the cookie on the backend.',
    {},
    async () => {
      try {
        if (session.isAuthenticated()) {
          await authApi.logout();
        }
        clearCredentials();
        resetClient();
        return toolResponse('Signed out. Use auth_login to sign in again.');
      } catch (error) {
        // Clear the local session even if the backend call failed — the
        // user's intent is to log out, and a stale token is worse than a
        // best-effort logout.
        clearCredentials();
        resetClient();
        return toolResponse(`Signed out locally. (${formatError(error)})`);
      }
    }
  );

  server.tool(
    'auth_signup',
    'Create a new Belmo account. The unified login flow signs you up automatically when the email is new — use auth_login instead. This tool just points you at the dashboard for OAuth signup.',
    {},
    async () => {
      return toolResponse(
        'New email + password? Use auth_login — accounts are created on the fly when the email is unknown.\n\n' +
        `Prefer Google or GitHub? Sign up at ${DASHBOARD_URL}/auth, then copy your session cookie and pass it to auth_token.`,
      );
    }
  );
}
