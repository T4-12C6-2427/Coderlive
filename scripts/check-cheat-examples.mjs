import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load entries via tsx / ts evaluation or import
// Since this is a test script, we can run via `npx tsx scripts/check-cheat-examples.mjs`
async function runChecks() {
  console.log('🔍 Checking Cheat Sheet examples for invisible/broken render blocks...\n');

  // Dynamically import data files using tsx loader
  const { HTML_CHEAT_ENTRIES } = await import('../src/data/cheatsheet-html.ts');
  const { CSS_CHEAT_ENTRIES } = await import('../src/data/cheatsheet-css.ts');
  const { JS_CHEAT_ENTRIES } = await import('../src/data/cheatsheet-js.ts');

  let errors = 0;
  let totalEntries = 0;

  function isCodeInvisible(html) {
    let stripped = html.trim();
    stripped = stripped.replace(/<!--[\s\S]*?-->/g, '');
    stripped = stripped.replace(/<!DOCTYPE[^>]*>/gi, '');
    stripped = stripped.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    stripped = stripped.replace(/<\/?(html|head|meta|link|base|style|script)[^>]*>/gi, '');
    stripped = stripped.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
    stripped = stripped.replace(/<\/?body[^>]*>/gi, '');
    stripped = stripped.trim();
    return stripped.length === 0;
  }

  // 1. Check HTML Cheat Sheet
  console.log(`Checking HTML entries (${HTML_CHEAT_ENTRIES.length} entries)...`);
  for (const entry of HTML_CHEAT_ENTRIES) {
    totalEntries++;
    const { id, term, example } = entry;

    if (!example || !example.code) {
      console.error(`❌ [HTML] ${id}: missing example.code`);
      errors++;
      continue;
    }

    if (example.kind === 'render') {
      if (isCodeInvisible(example.code)) {
        console.error(`❌ [HTML] ${id} (${term}): kind='render' but produces no visible output (purely invisible metadata/structure). Must be kind='explain' or provide visible wrapper!`);
        errors++;
      }
    }

    // Check for broken local image assets
    if (example.code.includes('banner.jpg') || example.code.includes('photo.jpg')) {
      console.error(`❌ [HTML] ${id} (${term}): contains broken local file reference! Use data URI or placeholder SVG.`);
      errors++;
    }
  }

  // 2. Check CSS Cheat Sheet
  console.log(`Checking CSS entries (${CSS_CHEAT_ENTRIES.length} entries)...`);
  for (const entry of CSS_CHEAT_ENTRIES) {
    totalEntries++;
    const { id, term, example } = entry;

    if (!example || !example.code) {
      console.error(`❌ [CSS] ${id}: missing example.code`);
      errors++;
      continue;
    }

    if (example.kind === 'render') {
      if (isCodeInvisible(example.code)) {
        console.error(`❌ [CSS] ${id} (${term}): kind='render' but has no visible HTML content!`);
        errors++;
      }
    }
  }

  // 3. Check JS Cheat Sheet
  console.log(`Checking JS entries (${JS_CHEAT_ENTRIES.length} entries)...`);
  for (const entry of JS_CHEAT_ENTRIES) {
    totalEntries++;
    const { id, term, example } = entry;

    if (!example || !example.code) {
      console.error(`❌ [JS] ${id}: missing example.code`);
      errors++;
      continue;
    }

    // Check for pseudo-code placeholders like `tenBien = giaTri` or bare code placeholders
    // We strip string literals and line comments before checking for code placeholder ellipsis
    const codeWithoutStrings = example.code
      .replace(/`[\s\S]*?`/g, '""')
      .replace(/"[^"]*"/g, '""')
      .replace(/'[^']*'/g, "''")
      .replace(/\/\/.*/g, '');

    if (codeWithoutStrings.includes('...') || example.code.includes('tenBien = giaTri') || example.code.includes('typeof giaTri')) {
      console.error(`❌ [JS] ${id} (${term}): contains unresolved pseudo-code placeholder! Must be runnable concrete code.`);
      errors++;
    }

    // Syntax validation and test execution via Function constructor
    try {
      const runner = new Function('console', 'document', 'window', 'setTimeout', 'setInterval', example.code);
      const dummyConsole = { log: () => {}, warn: () => {}, error: () => {}, info: () => {} };
      const dummyEl = {
        textContent: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => true },
        addEventListener: () => {},
      };
      const dummyDoc = {
        querySelector: () => dummyEl,
        querySelectorAll: () => [dummyEl],
        getElementById: () => dummyEl,
        createElement: () => dummyEl,
      };
      runner(dummyConsole, dummyDoc, {}, (fn) => setTimeout(fn, 0), () => 0);
    } catch (err) {
      console.error(`❌ [JS] ${id} (${term}): execution or syntax error in example code:`, err.message);
      errors++;
    }
  }

  // 4. Check HTML Lessons
  console.log('Checking HTML lessons (12 lessons)...');
  const { LESSONS } = await import('../src/data/lessons.ts');
  for (const lesson of LESSONS) {
    totalEntries++;
    if (!lesson.initialCode) {
      console.error(`❌ [Lesson HTML] #${lesson.id} (${lesson.title}): missing initialCode`);
      errors++;
      continue;
    }
    if (isCodeInvisible(lesson.initialCode)) {
      console.error(`❌ [Lesson HTML] #${lesson.id} (${lesson.title}): initialCode produces no visible content!`);
      errors++;
    }
  }

  // 5. Check JS Lessons
  console.log('Checking JS lessons (12 lessons)...');
  const { JS_LESSONS } = await import('../src/data/lessons-js.ts');
  for (const lesson of JS_LESSONS) {
    totalEntries++;
    if (!lesson.initialCode) {
      console.error(`❌ [Lesson JS] #${lesson.id} (${lesson.title}): missing initialCode`);
      errors++;
      continue;
    }
  }

  // 6. Check CSS Lessons
  console.log('Checking CSS lessons (12 lessons)...');
  const { CSS_LESSONS } = await import('../src/data/lessons-css.ts');
  for (const lesson of CSS_LESSONS) {
    totalEntries++;
    if (!lesson.initialCode) {
      console.error(`❌ [Lesson CSS] #${lesson.id} (${lesson.title}): missing initialCode`);
      errors++;
      continue;
    }
    if (isCodeInvisible(lesson.initialCode)) {
      console.error(`❌ [Lesson CSS] #${lesson.id} (${lesson.title}): initialCode produces no visible content!`);
      errors++;
    }
  }

  console.log(`\nVerified ${totalEntries} items across Cheat Sheets and Lessons.`);
  if (errors > 0) {
    console.error(`\n❌ Failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ All cheat sheet and lesson examples passed! Zero empty white boxes, all JS code is runnable.`);
    process.exit(0);
  }
}

runChecks().catch((err) => {
  console.error('Fatal check error:', err);
  process.exit(1);
});
