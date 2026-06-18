import { CONFIG } from '../config';

class Session {
  token: string | null = null;
  workspaceId: string | null = null;
  apiUrl: string = CONFIG.defaultApiUrl;

  setAuth(token: string) {
    this.token = token;
  }

  setWorkspace(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  clear() {
    this.token = null;
    this.workspaceId = null;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const session = new Session();
