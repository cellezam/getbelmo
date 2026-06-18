import * as fs from 'fs';
import { CONFIG } from '../config';
import { session } from './session';
import { encrypt, decrypt } from './crypto';

interface StoredCredentials {
  encrypted: string; // AES-256-GCM encrypted JSON of { token, selectedWorkspaceId }
  v: number;        // schema version
}

interface CredentialPayload {
  token: string;
  selectedWorkspaceId?: string;
}

export function loadCredentials(): void {
  try {
    if (!fs.existsSync(CONFIG.credentialsFile)) return;
    const raw = fs.readFileSync(CONFIG.credentialsFile, 'utf-8');
    const stored = JSON.parse(raw);

    let payload: CredentialPayload;
    if (stored.v === 2 && stored.encrypted) {
      // v2: encrypted
      payload = JSON.parse(decrypt(stored.encrypted));
    } else if (stored.token) {
      // v1 (legacy plaintext) — migrate on next save
      payload = stored as CredentialPayload;
    } else {
      return;
    }

    if (payload.token) {
      session.setAuth(payload.token);
    }
if (payload.selectedWorkspaceId) {
      session.setWorkspace(payload.selectedWorkspaceId);
    }
  } catch {
    // Ignore corrupt credentials
  }
}

export function saveCredentials(): void {
  try {
    if (!fs.existsSync(CONFIG.configDir)) {
      fs.mkdirSync(CONFIG.configDir, { recursive: true });
    }
    const payload: CredentialPayload = {
      token: session.token!,
      selectedWorkspaceId: session.workspaceId || undefined,
    };
    const stored: StoredCredentials = {
      encrypted: encrypt(JSON.stringify(payload)),
      v: 2,
    };
    fs.writeFileSync(CONFIG.credentialsFile, JSON.stringify(stored, null, 2), { mode: 0o600 });
  } catch {
    // Best-effort persistence
  }
}

export function clearCredentials(): void {
  try {
    if (fs.existsSync(CONFIG.credentialsFile)) {
      fs.unlinkSync(CONFIG.credentialsFile);
    }
  } catch {
    // Best-effort cleanup
  }
  session.clear();
}
