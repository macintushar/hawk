import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { readConfig, validateIncidents } from './config.ts';
import { readHistory } from './history.ts';
import { makeSnapshot } from './snapshot.ts';

const config = await readConfig();
const history = await readHistory();
const incidents = validateIncidents(JSON.parse(await readFile('data/incidents.json', 'utf8')), new Set(config.checks.map(check => check.id)));

await mkdir('dist/data', { recursive: true });
await cp('web', 'dist', { recursive: true });
await writeFile('dist/data/status.json', JSON.stringify(makeSnapshot(config, history, incidents)) + '\n');
console.log(`Published ${config.checks.length} checks and ${history.samples.length} samples to dist/`);
