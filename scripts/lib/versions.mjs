#!/usr/bin/env node
// Shared version utilities for dr-jskill scripts

import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = process.env.ROOT_DIR || resolve(__dirname, '..', '..');
const VERSIONS_FILE = process.env.VERSIONS_FILE || resolve(ROOT_DIR, 'versions.json');
const ASSETS_DIR = resolve(ROOT_DIR, 'assets');
const REFERENCES_DIR = resolve(ROOT_DIR, 'references');
const DOTFILES_MARKER = '# === dr-jskill additions ===';

/** Read a value from versions.json */
function getVersionValue(key, defaultValue = '') {
  if (!existsSync(VERSIONS_FILE)) return defaultValue;
  const data = JSON.parse(readFileSync(VERSIONS_FILE, 'utf8'));
  const value = data[key];
  return value != null && String(value).trim() !== '' ? String(value) : defaultValue;
}

export function getJavaVersion() { return getVersionValue('javaVersion', '25'); }
export function getBootPreferredMajor() { return getVersionValue('springBootPreferredMajor', '4'); }
export function getBootFallback() { return getVersionValue('springBootFallback', '4.0.2'); }
export function getPostgresVersion() { return getVersionValue('postgresVersion', '16'); }
export function getTemurinVersion() { return getVersionValue('temurinVersion', '25'); }
export function getMavenMinVersion() { return getVersionValue('mavenMinVersion', '3.8.0'); }
export function getGraalvmVersion() { return getVersionValue('graalvmVersion', '25'); }
export function getNodeVersion() { return getVersionValue('nodeVersion', '22.14.0'); }
export function getNpmVersion() { return getVersionValue('npmVersion', '10.9.4'); }
export function getViteVersion() { return getVersionValue('viteVersion', '5'); }
export function getMavenFrontendPluginVersion() { return getVersionValue('mavenFrontendPluginVersion', '1.15.1'); }
export function getVueVersion() { return getVersionValue('vueVersion', '3'); }
export function getReactVersion() { return getVersionValue('reactVersion', '18'); }
export function getAngularVersion() { return getVersionValue('angularVersion', '19'); }
export function getTestcontainersVersion() { return getVersionValue('testcontainersVersion', '2.0.0'); }
export function getSpringFrameworkVersion() { return getVersionValue('springFrameworkVersion', '7.0'); }
export function getHibernateVersion() { return getVersionValue('hibernateVersion', '7.1'); }

/**
 * Strip legacy qualifiers (.RELEASE, .GA) that Spring Boot 4+ no longer uses.
 * E.g. "4.0.2.RELEASE" → "4.0.2", "4.0.2" → "4.0.2"
 */
function stripLegacyQualifier(version) {
  return version.replace(/\.(RELEASE|GA)$/i, '');
}

/**
 * Check whether a Spring Boot version exists on Maven Central.
 * Returns true if the POM can be found (HTTP 200).
 */
async function existsOnMavenCentral(version) {
  const groupPath = 'org/springframework/boot/spring-boot';
  const url = `https://repo1.maven.org/maven2/${groupPath}/${version}/spring-boot-${version}.pom`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Resolve preferred Spring Boot version with fallback.
 * Fetches the default boot version from start.spring.io metadata,
 * validates it exists on Maven Central, and strips legacy qualifiers.
 * Only considers versions ≥ 4.x.
 */
export async function resolveBootVersion(preferredMajor, fallback) {
  preferredMajor = preferredMajor || getBootPreferredMajor();
  fallback = fallback || getBootFallback();
  try {
    const response = await fetch('https://start.spring.io', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error(`Warning: start.spring.io returned HTTP ${response.status}. Using fallback ${fallback}.`);
      return fallback;
    }
    const metadata = await response.json();

    // Try multiple metadata paths (API may evolve)
    const fetched = metadata?.bootVersion?.default
      || metadata?.platformVersion?.default
      || metadata?.bootVersion;

    if (!fetched || typeof fetched !== 'string') {
      console.error(`Warning: could not read bootVersion from start.spring.io metadata. Using fallback ${fallback}.`);
      return fallback;
    }

    const cleaned = stripLegacyQualifier(fetched);

    if (cleaned.startsWith(`${preferredMajor}.`)) {
      // Verify the version actually exists on Maven Central
      if (await existsOnMavenCentral(cleaned)) {
        return cleaned;
      }
      console.error(`⚠️  Spring Boot ${cleaned} (from start.spring.io) is not on Maven Central yet. Using fallback ${fallback}.`);
      return fallback;
    }

    // start.spring.io default doesn't match our preferred major — scan available versions
    const values = metadata?.bootVersion?.values || [];
    const candidates = values
      .map(v => typeof v === 'string' ? v : v?.id)
      .filter(Boolean)
      .map(stripLegacyQualifier)
      .filter(v => v.startsWith(`${preferredMajor}.`) && !v.includes('-'));
    // Pick the highest stable version from the list
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      if (await existsOnMavenCentral(candidates[0])) {
        return candidates[0];
      }
    }

    console.error(
      `⚠️  start.spring.io default bootVersion (${fetched}) does not match preferred major ${preferredMajor}. Using fallback ${fallback}. Override with --boot-version if needed.`
    );
    return fallback;
  } catch (err) {
    console.error(`Warning: Failed to fetch bootVersion from start.spring.io: ${err?.message || String(err)}. Using fallback ${fallback}.`);
    return fallback;
  }
}

/** Normalize dependency list, ensuring unique comma-separated values */
export function joinDependencies(...args) {
  const all = args.join(',').split(',').map(s => s.trim()).filter(Boolean);
  return [...new Set(all)].join(',');
}

/**
 * Download a file from a URL and save it to disk.
 * Uses Node.js built-in fetch API.
 */
export async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: HTTP ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(dest, buffer);
}

/**
 * Extract a zip file to the current directory.
 * Uses platform-appropriate tools (unzip on Unix, PowerShell on Windows).
 */
export function extractZip(zipPath) {
  if (process.platform === 'win32') {
    execFileSync('powershell', [
      '-NoLogo', '-NoProfile', '-Command',
      `Expand-Archive -Path '${zipPath}' -DestinationPath '.' -Force`,
    ], { stdio: 'inherit' });
  } else {
    execFileSync('unzip', ['-q', zipPath], { stdio: 'inherit' });
  }
}

/**
 * Download and extract a Spring Boot project from start.spring.io.
 * Automatically strips legacy .RELEASE/.GA qualifiers from bootVersion.
 */
export async function downloadAndExtractProject(params) {
  if (params.bootVersion) {
    params.bootVersion = stripLegacyQualifier(params.bootVersion);
  }
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = `https://start.spring.io/starter.zip?${query}`;
  const zipFile = `${params.baseDir}.zip`;

  await downloadFile(url, zipFile);
  extractZip(zipFile);
  unlinkSync(zipFile);

  // Ensure pom.xml has <start-class> for process-aot main class detection
  if (params.packageName && params.name) {
    const mainClassName = toCamelCase(params.name) + 'Application';
    patchPomStartClass(params.baseDir, `${params.packageName}.${mainClassName}`);
  }
}

/**
 * Convert a kebab-case or snake_case name to CamelCase.
 * e.g. "my-spring-app" → "MySpringApp"
 */
function toCamelCase(name) {
  return name
    .split(/[-_]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Inject <start-class> property into an existing pom.xml.
 * Spring Boot 4's process-aot goal requires an explicit main class.
 */
export function patchPomStartClass(projectDir, mainClass) {
  const pomPath = join(projectDir, 'pom.xml');
  if (!existsSync(pomPath)) return;
  let pom = readFileSync(pomPath, 'utf8');
  if (pom.includes('<start-class>')) return; // Already present
  // Insert after <java.version>...</java.version> inside <properties>
  const javaVersionTag = /<java\.version>[^<]*<\/java\.version>/;
  const match = pom.match(javaVersionTag);
  if (match) {
    pom = pom.replace(javaVersionTag, `${match[0]}\n\t\t<start-class>${mainClass}</start-class>`);
    writeFileSync(pomPath, pom, 'utf8');
  }
}

/**
 * Append or merge .gitignore content. Preserves existing content; appends our template once.
 */
export function mergeGitignore(projectDir) {
  const target = join(projectDir, '.gitignore');
  const templatePath = resolve(ASSETS_DIR, 'gitignore');
  if (!existsSync(templatePath)) return;
  const templateContent = readFileSync(templatePath, 'utf8');
  if (!existsSync(target)) {
    writeFileSync(target, templateContent, 'utf8');
    return;
  }
  const current = readFileSync(target, 'utf8');
  if (current.includes(DOTFILES_MARKER)) return; // Already appended
  const merged = `${current.trimEnd()}\n\n${DOTFILES_MARKER}\n${templateContent.trim()}\n`;
  writeFileSync(target, merged, 'utf8');
}

function copyAssetIfMissing(assetName, destPath) {
  const assetPath = resolve(ASSETS_DIR, assetName);
  if (!existsSync(assetPath)) return;
  if (existsSync(destPath)) return;
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  copyFileSync(assetPath, destPath);
}

function writeTextFileIfMissing(destPath, content) {
  if (existsSync(destPath)) return;
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  writeFileSync(destPath, content, 'utf8');
}

function copyFileIfMissing(sourcePath, destPath) {
  if (!existsSync(sourcePath)) return;
  if (existsSync(destPath)) return;
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  copyFileSync(sourcePath, destPath);
}

function normalizeBackendArchitecture(style) {
  if (!style) return '';
  const normalized = String(style).trim().toLowerCase();
  if (normalized === 'clean') return 'clean';
  if (normalized === 'layered') return 'layered';
  if (normalized === 'books-etl' || normalized === 'etl') return 'etl';
  throw new Error(
    `Unknown backend architecture: ${style}. Valid options: clean, layered, etl`
  );
}

function toPackageSuffix(relativeDir) {
  return relativeDir.split('/').filter(Boolean).join('.');
}

function toJavaPackage(packageName, relativeDir = '') {
  const suffix = toPackageSuffix(relativeDir);
  return suffix ? `${packageName}.${suffix}` : packageName;
}

function writePackageInfo(projectDir, packageName, relativeDir, description) {
  const javaPackage = toJavaPackage(packageName, relativeDir);
  const target = join(
    projectDir,
    'src',
    'main',
    'java',
    ...packageName.split('.'),
    ...relativeDir.split('/').filter(Boolean),
    'package-info.java'
  );
  writeTextFileIfMissing(
    target,
    `/**\n * ${description}\n */\npackage ${javaPackage};\n`
  );
}

function copyArchitectureReferences(projectDir, fileNames) {
  for (const fileName of fileNames) {
    copyFileIfMissing(
      join(REFERENCES_DIR, fileName),
      join(projectDir, 'docs', 'architecture', fileName)
    );
  }
}

function writeArchitectureGuide(projectDir, style) {
  const docsByStyle = {
    clean: ['CLEAN-ARCHITECTURE.md'],
    layered: ['LAYERED-ARCHITECTURE.md'],
    etl: [
      'CLEAN-ARCHITECTURE-ETL.md',
      'CLEAN-ARCHITECTURE-ETL-PACKAGE-LAYOUT.md',
      'CLEAN-ARCHITECTURE-ETL-DOMAIN-PATTERNS.md',
      'CLEAN-ARCHITECTURE-ETL-ADAPTERS-AND-WORKFLOW.md',
      'CLEAN-ARCHITECTURE-ETL-GENERATION-CHECKLIST.md',
    ],
  };
  const labelsByStyle = {
    clean: 'Clean Architecture',
    layered: 'Layered Architecture',
    etl: 'ETL Clean Architecture',
  };
  const files = docsByStyle[style] || [];
  copyArchitectureReferences(projectDir, files);
  const fileList = files
    .map((fileName) => `- \`docs/architecture/${fileName}\``)
    .join('\n');
  writeTextFileIfMissing(
    join(projectDir, 'ARCHITECTURE.md'),
    `# Backend Architecture\n\nSelected style: **${labelsByStyle[style]}**.\n\nRead these project guides before implementing the first feature:\n${fileList}\n`
  );
}

function applyCleanArchitecture(projectDir, packageName) {
  const packages = [
    ['domain/model', 'Domain models and aggregate roots.'],
    ['domain/valueobject', 'Framework-free value objects.'],
    ['domain/service', 'Domain services and business policies.'],
    ['domain/exception', 'Domain-specific exceptions.'],
    ['domain/port/in', 'Input ports defining supported use cases.'],
    ['domain/port/out', 'Output ports for infrastructure dependencies.'],
    ['application/usecase', 'Application use-case implementations.'],
    ['application/service', 'Application orchestration services.'],
    ['application/mapper', 'Mappers between application DTOs and domain models.'],
    ['infrastructure/security/jwt', 'JWT technical components.'],
    ['infrastructure/security/adapter', 'Security adapters implementing ports.'],
    ['infrastructure/messaging/broker/producer', 'Outbound broker publishers.'],
    ['infrastructure/messaging/broker/consumer', 'Inbound broker consumers.'],
    ['infrastructure/messaging/adapter', 'Messaging adapters.'],
    ['infrastructure/persistence/entity', 'Persistence entities.'],
    ['infrastructure/persistence/repository', 'Spring Data repositories.'],
    ['infrastructure/persistence/adapter', 'Persistence adapters implementing ports.'],
    ['infrastructure/config', 'Infrastructure configuration and bean wiring.'],
    ['infrastructure/external', 'External service clients and integrations.'],
    ['web/rest', 'REST controllers.'],
    ['web/dto', 'HTTP request and response DTOs.'],
    ['web/mapper', 'Web mappers.'],
    ['web/security', 'HTTP security entry points.'],
    ['web/advice', 'Exception translation for HTTP APIs.'],
  ];
  for (const [relativeDir, description] of packages) {
    writePackageInfo(projectDir, packageName, relativeDir, description);
  }
  writeArchitectureGuide(projectDir, 'clean');
}

function applyLayeredArchitecture(projectDir, packageName) {
  const basePackage = `${packageName}.app`;
  const packages = [
    ['aop', 'Cross-cutting AOP support.'],
    ['config', 'Spring configuration.'],
    ['domain', 'Entities and core domain state.'],
    ['management', 'Management and monitoring endpoints.'],
    ['repository', 'Spring Data repositories.'],
    ['security', 'Security components and utilities.'],
    ['service', 'Transactional business services.'],
    ['service/dto', 'Service-layer DTOs.'],
    ['service/mapper', 'Service-layer mappers.'],
    ['web/filter', 'HTTP filters.'],
    ['web/rest', 'REST controllers.'],
  ];
  for (const [relativeDir, description] of packages) {
    writePackageInfo(projectDir, basePackage, relativeDir, description);
  }
  writeArchitectureGuide(projectDir, 'layered');
}

function applyEtlArchitecture(projectDir, packageName) {
  const packages = [
    ['application', 'Adapter-facing use cases.'],
    ['domain', 'Business models, ports, and domain services.'],
    ['infrastructure', 'Technical adapters and configuration.'],
    ['infrastructure/config', 'Explicit bean wiring and technical configuration.'],
    ['infrastructure/database/jpa/adapter', 'JPA adapters implementing domain ports.'],
    ['infrastructure/database/jpa/entity', 'JPA persistence entities.'],
    ['infrastructure/database/jpa/mapper', 'Mappers between entities and domain models.'],
    ['infrastructure/database/jpa/repository', 'Spring Data repositories.'],
    ['interfaces', 'HTTP and external input adapters.'],
    ['interfaces/web', 'Web configuration.'],
    ['interfaces/web/rest', 'REST resources.'],
    ['interfaces/web/rest/errors', 'HTTP exception translation.'],
    ['shared', 'Cross-cutting primitives.'],
    ['shared/pagination', 'Pagination primitives shared across features.'],
    ['workflow', 'Long-running orchestration workflows.'],
  ];
  for (const [relativeDir, description] of packages) {
    writePackageInfo(projectDir, packageName, relativeDir, description);
  }
  writeTextFileIfMissing(
    join(
      projectDir,
      'src',
      'main',
      'java',
      ...packageName.split('.'),
      'shared',
      'pagination',
      'PageCriteria.java'
    ),
    `package ${packageName}.shared.pagination;\n\npublic record PageCriteria(int page, int size) {\n  public PageCriteria {\n    if (page < 0) {\n      throw new IllegalArgumentException("page must be >= 0");\n    }\n    if (size < 1) {\n      throw new IllegalArgumentException("size must be >= 1");\n    }\n  }\n}\n`
  );
  writeTextFileIfMissing(
    join(
      projectDir,
      'src',
      'main',
      'java',
      ...packageName.split('.'),
      'shared',
      'pagination',
      'PageResult.java'
    ),
    `package ${packageName}.shared.pagination;\n\nimport java.util.List;\n\npublic record PageResult<T>(List<T> content, long totalElements, int page, int size) {\n}\n`
  );
  writeTextFileIfMissing(
    join(
      projectDir,
      'src',
      'main',
      'java',
      ...packageName.split('.'),
      'infrastructure',
      'config',
      'BeanConfiguration.java'
    ),
    `package ${packageName}.infrastructure.config;\n\nimport org.springframework.context.annotation.Configuration;\n\n/**\n * Explicit composition root for domain services and use cases.\n */\n@Configuration\npublic class BeanConfiguration {\n}\n`
  );
  writeArchitectureGuide(projectDir, 'etl');
}

export function applyBackendArchitecture(projectDir, options = {}) {
  const style = normalizeBackendArchitecture(options.backendArchitecture);
  if (!style) return;
  if (!options.packageName) {
    throw new Error('packageName is required to scaffold backend architecture packages.');
  }
  switch (style) {
    case 'clean':
      applyCleanArchitecture(projectDir, options.packageName);
      return;
    case 'layered':
      applyLayeredArchitecture(projectDir, options.packageName);
      return;
    case 'etl':
      applyEtlArchitecture(projectDir, options.packageName);
      return;
    default:
      throw new Error(`Unsupported backend architecture: ${style}`);
  }
}

/**
 * Remove the frontend COPY lines from a Dockerfile when no frontend is present.
 */
function stripFrontendCopyLines(filePath) {
  if (!existsSync(filePath)) return;
  let content = readFileSync(filePath, 'utf8');
  // Remove the comment + COPY frontend block (2-3 lines)
  content = content.replace(
    /# Copy frontend directory[^\n]*\n(?:#[^\n]*\n)*COPY frontend [^\n]*\n/g,
    ''
  );
  writeFileSync(filePath, content, 'utf8');
}

/**
 * Apply additional dotfiles after project extraction.
 * @param {string} projectDir
 * @param {{ database?: boolean, frontend?: boolean }} [options]
 */
export function applyDotfiles(projectDir, options = {}) {
  const hasDatabase = options.database === true;
  const hasFrontend = options.frontend === true;
  mergeGitignore(projectDir);
  copyAssetIfMissing('env.sample', join(projectDir, '.env.sample'));
  copyAssetIfMissing('editorconfig', join(projectDir, '.editorconfig'));
  copyAssetIfMissing('gitattributes', join(projectDir, '.gitattributes'));
  copyAssetIfMissing('dockerignore', join(projectDir, '.dockerignore'));
  // Docker deployment files (Dockerfiles always, compose files only with database)
  copyAssetIfMissing('Dockerfile', join(projectDir, 'Dockerfile'));
  copyAssetIfMissing('Dockerfile-native', join(projectDir, 'Dockerfile-native'));
  if (!hasFrontend) {
    stripFrontendCopyLines(join(projectDir, 'Dockerfile'));
    stripFrontendCopyLines(join(projectDir, 'Dockerfile-native'));
  }
  if (hasDatabase) {
    copyAssetIfMissing('compose.yaml', join(projectDir, 'compose.yaml'));
    copyAssetIfMissing('docker-compose.yml', join(projectDir, 'docker-compose.yml'));
    copyAssetIfMissing('docker-compose-native.yml', join(projectDir, 'docker-compose-native.yml'));
  }
  // Optional .vscode recommendations
  copyAssetIfMissing(join('vscode', 'extensions.json'), join(projectDir, '.vscode', 'extensions.json'));
  copyAssetIfMissing(join('vscode', 'settings.json'), join(projectDir, '.vscode', 'settings.json'));
  // DevContainer setup
  copyAssetIfMissing(join('devcontainer', 'devcontainer.json'), join(projectDir, '.devcontainer', 'devcontainer.json'));
  if (hasDatabase) {
    copyAssetIfMissing(join('devcontainer', 'docker-compose.yml'), join(projectDir, '.devcontainer', 'docker-compose.yml'));
  }
  // CI workflow
  copyAssetIfMissing(join('ci', 'github-actions.yml'), join(projectDir, '.github', 'workflows', 'ci.yml'));
  // Optional Node version pinning if front-end present
  try {
    const nodeVersion = getNodeVersion();
    if (nodeVersion) {
      writeTextFileIfMissing(join(projectDir, '.nvmrc'), `${nodeVersion}\n`);
      writeTextFileIfMissing(join(projectDir, '.node-version'), `${nodeVersion}\n`);
    }
  } catch (e) {
    // Non-fatal
  }
}

/**
 * Parse CLI arguments into an object with flags and positional args.
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {};
  const positional = [];
  let i = 0;
  while (i < args.length) {
    if (args[i] === '--boot-version') {
      flags.bootVersion = args[i + 1];
      i += 2;
    } else if (args[i] === '--project-type') {
      flags.projectType = args[i + 1];
      i += 2;
    } else if (args[i] === '--backend-architecture') {
      flags.backendArchitecture = args[i + 1];
      i += 2;
    } else if (args[i] === '-h' || args[i] === '--help') {
      flags.help = true;
      i += 1;
    } else if (args[i] === '--') {
      positional.push(...args.slice(i + 1));
      break;
    } else if (args[i].startsWith('-')) {
      console.error(`Unknown option: ${args[i]}`);
      flags.help = true;
      i += 1;
    } else {
      positional.push(args[i]);
      i += 1;
    }
  }
  return { flags, positional };
}
