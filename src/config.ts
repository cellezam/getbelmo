import * as path from 'path';
import * as os from 'os';

export const CONFIG = {
  version: '1.0.0',
  defaultApiUrl: 'https://backend.belmo.io/hostingguru',
  configDir: path.join(os.homedir(), '.hostingguru'),
  credentialsFile: path.join(os.homedir(), '.hostingguru', 'credentials.json'),
};
