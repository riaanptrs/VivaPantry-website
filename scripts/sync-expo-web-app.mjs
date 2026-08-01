import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const [
  exportArg,
  sourceCommit = 'unknown',
  expoVersion = null,
  androidVersionCodeArg = null,
] = process.argv.slice(2);

if (!exportArg) {
  throw new Error('Usage: node scripts/sync-expo-web-app.mjs <expo-dist-directory> [source-commit]');
}

const siteRoot = path.resolve('.');
const exportRoot = path.resolve(exportArg);
const targetRoot = path.resolve(siteRoot, 'app');

if (!existsSync(path.join(exportRoot, 'index.html'))) {
  throw new Error(`Expo export is missing index.html: ${exportRoot}`);
}

if (path.dirname(targetRoot) !== siteRoot || path.basename(targetRoot) !== 'app') {
  throw new Error(`Refusing to replace unexpected target: ${targetRoot}`);
}

rmSync(targetRoot, { recursive: true, force: true });
cpSync(exportRoot, targetRoot, { recursive: true });

function collectHtmlFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(absolute, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(absolute);
    }
  }
  return files;
}

for (const htmlFile of collectHtmlFiles(targetRoot)) {
  const relative = path.relative(targetRoot, htmlFile);
  if (relative === 'index.html' || path.basename(htmlFile) === 'index.html') continue;

  const cleanRouteDirectory = htmlFile.slice(0, -'.html'.length);
  mkdirSync(cleanRouteDirectory, { recursive: true });
  writeFileSync(
    path.join(cleanRouteDirectory, 'index.html'),
    readFileSync(htmlFile),
  );
}

writeFileSync(
  path.join(targetRoot, 'build-provenance.json'),
  `${JSON.stringify({
    sourceRepository: 'riaanptrs/VivaPantry',
    sourceCommit,
    expoVersion,
    androidVersionCode: androidVersionCodeArg == null
      ? null
      : Number(androidVersionCodeArg),
    generatedAt: new Date().toISOString(),
  }, null, 2)}\n`,
);

console.log(`Synced Expo Web export from ${sourceCommit} to ${targetRoot}`);
