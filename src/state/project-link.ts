import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

export interface ProjectLink {
  workspaceId: string;
  deploymentId: string;
  deploymentName: string;
  projectId?: string;
  linkedAt: string;
}

const LINK_DIR = '.hostingguru';
const LINK_FILE = 'project.json';

function linkPath(dir: string): string {
  return join(dir, LINK_DIR, LINK_FILE);
}

export function linkExists(dir: string): boolean {
  return existsSync(linkPath(resolve(dir)));
}

export function writeLink(dir: string, link: ProjectLink): string {
  const absDir = resolve(dir);
  mkdirSync(join(absDir, LINK_DIR), { recursive: true });
  const file = linkPath(absDir);
  writeFileSync(file, JSON.stringify(link, null, 2) + '\n', 'utf8');
  return file;
}

export function readLink(dir: string): ProjectLink {
  const file = linkPath(resolve(dir));
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function resolveLink(startDir: string): { link: ProjectLink; root: string } {
  let cur = resolve(startDir);
  while (true) {
    if (existsSync(linkPath(cur))) {
      return { link: JSON.parse(readFileSync(linkPath(cur), 'utf8')), root: cur };
    }
    const parent = dirname(cur);
    if (parent === cur) {
      throw new Error(
        `No .hostingguru/project.json found in ${startDir} or any parent. ` +
          `Run project_link first.`
      );
    }
    cur = parent;
  }
}
