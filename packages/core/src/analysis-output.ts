import fs from 'node:fs/promises';
import path from 'node:path';
import { inside } from './snapshots.ts';

async function prospective(directory: string): Promise<string> {
  try { return await fs.realpath(directory); } catch (e) {
    if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ENOENT') throw e;
    const parent = path.dirname(directory); if (parent === directory) throw e;
    return path.join(await prospective(parent), path.basename(directory));
  }
}
export async function writeAnalysisOutput(directory: string, forbiddenDirectories: string[], files: Record<string, string>) {
  const destination = await prospective(path.resolve(directory));
  for (const root of forbiddenDirectories) if (inside(await fs.realpath(root), destination)) throw new Error('Output must be outside protected directories.');
  if (!Object.keys(files).every(name => /^[a-z0-9-]+\.(json|md|svg)$/.test(name))) throw new Error('Invalid output name.');
  await fs.mkdir(path.dirname(destination), { recursive: true }); await fs.mkdir(destination);
  if (await fs.realpath(destination) !== destination) throw new Error('Output directory changed.');
  for (const [name, content] of Object.entries(files)) await fs.writeFile(path.join(destination, name), content, { flag: 'wx', mode: 0o600 });
}
