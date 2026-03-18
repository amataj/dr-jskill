import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function buildPlan(model) {
  const files = [
    'docs/architecture/ARCHITECTURE-MODEL.json',
    'docs/architecture/GENERATION-PLAN.md',
  ];

  for (const entity of model.entities) {
    files.push(`src/main/java/<package>/domain/${entity.featureName}/${entity.name}.java`);
    files.push(`src/main/java/<package>/application/${entity.featureName}/${entity.name}UseCase.java`);
    files.push(`src/main/java/<package>/interfaces/web/rest/${entity.name}Resource.java`);
    files.push(`src/main/java/<package>/infrastructure/database/jpa/entity/${entity.name}Entity.java`);
  }

  return files;
}

function buildPlanMarkdown(model, files) {
  const entityLines = model.entities.length === 0
    ? '- No entities discovered yet.'
    : model.entities.map((entity) => `- ${entity.name} -> ${entity.featureName}`);
  const fileLines = files.map((file) => `- ${file}`);
  return `# CL ETL Generator Plan

Source: \`${model.source.path}\`
Architecture: \`${model.architecture}\`

## Entities
${entityLines.join('\n')}

## Planned Files
${fileLines.join('\n')}
`;
}

export async function generateProject({ model, outputDir, write = false }) {
  const plannedFiles = buildPlan(model);
  const result = {
    mode: write ? 'write' : 'dry-run',
    outputDir,
    entityCount: model.entities.length,
    enumCount: model.enums.length,
    plannedFiles,
  };

  if (!write) {
    return result;
  }

  const docsDir = join(outputDir, 'docs', 'architecture');
  await mkdir(docsDir, { recursive: true });
  await writeFile(
    join(docsDir, 'ARCHITECTURE-MODEL.json'),
    `${JSON.stringify(model, null, 2)}\n`,
    'utf8'
  );
  await writeFile(
    join(docsDir, 'GENERATION-PLAN.md'),
    `${buildPlanMarkdown(model, plannedFiles)}\n`,
    'utf8'
  );

  return result;
}
