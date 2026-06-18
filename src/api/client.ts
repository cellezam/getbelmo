import axios, { AxiosInstance } from 'axios';
import { session } from '../state/session';
import { clearCredentials } from '../state/credentials';

let _client: AxiosInstance | null = null;

export function getClient(): AxiosInstance {
  if (_client && _client.defaults.baseURL === session.apiUrl) {
    return _client;
  }

  _client = axios.create({
    baseURL: session.apiUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Backend AuthenticationMiddleware is cookie-only — JWT is no longer
  // accepted in the Authorization header or any URL parameter. Send the
  // token via Cookie so the same `readAuthCookie` path that serves the
  // dashboard also serves the CLI.
  _client.interceptors.request.use((config) => {
    if (session.token) {
      config.headers.Cookie = `token=${session.token}`;
    }
    if (session.workspaceId) {
      config.headers['X-Workspace-Id'] = session.workspaceId;
    }
    return config;
  });

  _client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearCredentials();
      }
      return Promise.reject(error);
    }
  );

  return _client;
}

export function resetClient(): void {
  _client = null;
}
