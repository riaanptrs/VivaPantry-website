import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../app/', import.meta.url));

// Expo exports route.html, but GitHub Pages serves /route/ from route/index.html.
// Keep both forms so direct visits and Expo Router navigation work alike.
function writeDirectoryRoutes(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['assets', '_expo', '.well-known'].includes(entry.name)) {
        writeDirectoryRoutes(source);
      }
    } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
      const destination = path.join(directory, entry.name.slice(0, -5));
      mkdirSync(destination, { recursive: true });
      copyFileSync(source, path.join(destination, 'index.html'));
    }
  }
}

if (existsSync(appRoot)) writeDirectoryRoutes(appRoot);
