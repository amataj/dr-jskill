import { readFile } from 'node:fs/promises';

function extractNames(content, keyword) {
  const pattern = new RegExp(`\\b${keyword}\\s+([A-Z][A-Za-z0-9_]*)`, 'g');
  const names = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    names.push(match[1]);
  }
  return [...new Set(names)];
}

export async function parseJdlFile(jdlPath) {
  const raw = await readFile(jdlPath, 'utf8');
  return {
    jdlPath,
    raw,
    entities: extractNames(raw, 'entity'),
    enums: extractNames(raw, 'enum'),
  };
}
