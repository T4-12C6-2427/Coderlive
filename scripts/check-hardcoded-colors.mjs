#!/usr/bin/env node

/**
 * scripts/check-hardcoded-colors.mjs
 * Dev-time lint check that scans src/ and fails if any hardcoded color or
 * Tailwind palette class is found outside the allowlist.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Allowlist files that legitimately define base tokens, themes, or user template sandbox code
const ALLOWLIST_FILES = new Set([
  path.resolve(SRC_DIR, 'constants/templates.ts'), // User-provided sandboxed HTML/CSS/JS
  path.resolve(SRC_DIR, 'lib/themeEngine.ts'),     // Base theme palettes, math & color scales
  path.resolve(SRC_DIR, 'types/theme.ts'),         // Preset definitions
  path.resolve(SRC_DIR, 'index.css'),             // CSS token variable declarations
]);

// Patterns for disallowed hardcoded Tailwind palette classes in TSX/TS files
const TAILWIND_PALETTE_REGEX = /\b(bg|text|border|ring|shadow|from|via|to)-(slate|zinc|neutral|stone|gray|indigo|violet|purple|fuchsia|pink)-(100|200|300|400|500|600|700|800|900|950)\b/g;

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.flatMap((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return files;
}

function runCheck() {
  const allFiles = getFiles(SRC_DIR).filter(
    (f) => (f.endsWith('.tsx') || f.endsWith('.ts')) && !ALLOWLIST_FILES.has(f)
  );

  let totalViolations = 0;
  const violationsByFile = new Map();

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const fileViolations = [];

    lines.forEach((line, idx) => {
      // Ignore comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

      const matches = [...line.matchAll(TAILWIND_PALETTE_REGEX)];
      if (matches.length > 0) {
        fileViolations.push({
          line: idx + 1,
          matches: matches.map((m) => m[0]),
          text: line.trim(),
        });
      }
    });

    if (fileViolations.length > 0) {
      violationsByFile.set(filePath, fileViolations);
      totalViolations += fileViolations.length;
    }
  }

  const rel = (p) => path.relative(path.resolve(__dirname, '..'), p);

  console.log('----------------------------------------------------');
  console.log('🎨 Kiểm Tra Mã Màu Cứng (Coderlive Token Linter)');
  console.log('----------------------------------------------------');

  if (totalViolations === 0) {
    console.log('✅ TUYỆT VỜI: Không tìm thấy màu cứng nào trong mã giao diện src/!');
    console.log('Tất cả thành phần đều sử dụng semantic design tokens.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } else {
    console.warn(`⚠️  Phát hiện ${totalViolations} vị trí sử dụng class màu bảng Tailwind:`);
    for (const [filePath, list] of violationsByFile.entries()) {
      console.log(`\n📄 ${rel(filePath)}:`);
      list.slice(0, 5).forEach((v) => {
        console.log(`   Dòng ${v.line}: [${v.matches.join(', ')}] -> ${v.text.slice(0, 80)}...`);
      });
      if (list.length > 5) {
        console.log(`   ... và ${list.length - 5} vị trí khác trong tệp này.`);
      }
    }
    console.log('----------------------------------------------------');
    // Exit with 1 in CI if strict
    process.exit(1);
  }
}

runCheck();
