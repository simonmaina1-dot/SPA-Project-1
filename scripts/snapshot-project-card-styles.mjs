#!/usr/bin/env node
/**
 * Snapshot CSS rules that reference a given set of classnames.
 * - Scans .css/.scss/.sass/.less
 * - Extracts full rule blocks (selectors + declarations), incl pseudos and combined selectors
 * - Adds file + line number comments
 * - Writes a snapshot CSS file you can diff across branches
 *
 * Usage:
 *   node scripts/snapshot-project-card-styles.mjs
 *   node scripts/snapshot-project-card-styles.mjs --root . --out style-snapshots/project-card.snapshot.css
 */

import fs from "fs";
import path from "path";

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const key = a.replace(/^--/, "");
    const val =
      process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
        ? process.argv[++i]
        : "true";
    args.set(key, val);
  }
}

const ROOT = path.resolve(String(args.get("root") ?? process.cwd()));
const OUT = path.resolve(
  ROOT,
  String(args.get("out") ?? "style-snapshots/project-card.snapshot.css")
);

const STYLE_EXTS = new Set([".css", ".scss", ".sass", ".less"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  ".git",
  ".turbo",
  ".vercel",
  "coverage",
]);

// ✅ Classnames from your latest markup snippet
const CLASSES = [
  "project-card-shell",
  "project-card",
  "featured",
  "project-card-slides",
  "project-card-slide",
  "active",
  "loaded",
  "project-card-overlay",
  "project-card-content",
  "project-card-header",
  "project-status-badge",
  "status-badge-active",
  "project-category",
  "project-title",
  "project-description",
  "project-card-details",
  "project-funding-card",
  "project-funding-info",
  "funding-row",
  "funding-label",
  "funding-value",
  "project-progress-card",
  "funding-percentage",
  "funding-bar",
  "funding-progress",
  "project-card-footer",
  "learn-more-btn",
];

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(full, files);
    } else {
      const ext = path.extname(ent.name).toLowerCase();
      if (STYLE_EXTS.has(ext)) files.push(full);
    }
  }
  return files;
}

function indexToLine(text, idx) {
  // 1-based line
  let line = 1;
  for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function extractBlock(text, braceIdx) {
  // braceIdx must point at "{"
  let i = braceIdx;
  let depth = 0;
  let inStr = false;
  let strCh = "";
  let inComment = false;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    // /* comment */
    if (!inStr && ch === "/" && next === "*") {
      inComment = true;
      i += 2;
      continue;
    }
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    // strings
    if (!inStr && (ch === `"` || ch === `'`)) {
      inStr = true;
      strCh = ch;
      i++;
      continue;
    }
    if (inStr) {
      if (ch === "\\" && i + 1 < text.length) {
        i += 2;
        continue;
      }
      if (ch === strCh) {
        inStr = false;
        strCh = "";
      }
      i++;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { endIdx: i, block: text.slice(braceIdx, i + 1) };
    }
    i++;
  }
  return null;
}

function isRuleStartBoundary(ch) {
  return ch === "}" || ch === "{" || ch === "\n" || ch === "\r";
}

function findRuleForMatch(text, matchIdx) {
  // Find selector start (scan backward)
  let selStart = matchIdx;
  while (selStart > 0 && !isRuleStartBoundary(text[selStart - 1])) selStart--;

  // Find opening brace for this rule (scan forward)
  let braceIdx = matchIdx;
  while (braceIdx < text.length && text[braceIdx] !== "{") {
    // if we hit a closing brace first, likely not a selector context
    if (text[braceIdx] === "}") return null;
    braceIdx++;
  }
  if (braceIdx >= text.length || text[braceIdx] !== "{") return null;

  const selector = text.slice(selStart, braceIdx).trim();
  if (!selector) return null;

  const extracted = extractBlock(text, braceIdx);
  if (!extracted) return null;

  return {
    selStart,
    braceIdx,
    endIdx: extracted.endIdx,
    selector,
    ruleText: `${selector} ${extracted.block}`.trim(),
  };
}

function makeClassRegex(cls) {
  // match ".cls" but not ".clsX"
  return new RegExp(`\\.${cls}(?![A-Za-z0-9_-])`, "g");
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

const styleFiles = walk(ROOT);
const hits = [];

for (const file of styleFiles) {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, "utf8");

  for (const cls of CLASSES) {
    const re = makeClassRegex(cls);
    let m;
    while ((m = re.exec(text)) !== null) {
      const rule = findRuleForMatch(text, m.index);
      if (!rule) continue;

      const line = indexToLine(text, rule.selStart);

      hits.push({
        file: rel,
        line,
        selector: rule.selector,
        ruleText: rule.ruleText,
        // helps dedupe when the same rule is found via multiple class matches
        key: `${rel}:${line}:${rule.selector}`,
      });

      // Skip forward past this rule to avoid re-capturing same block a million times
      re.lastIndex = rule.endIdx + 1;
    }
  }
}

const uniq = uniqueBy(hits, h => h.key).sort((a, b) => {
  if (a.file !== b.file) return a.file.localeCompare(b.file);
  return a.line - b.line;
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });

let out = "";
out += `/* Snapshot styles for Project Card\n`;
out += `   root: ${ROOT}\n`;
out += `   generated: ${new Date().toISOString()}\n`;
out += `   matched classes: ${CLASSES.length}\n`;
out += `   matched rules: ${uniq.length}\n`;
out += `*/\n\n`;

for (const h of uniq) {
  out += `/* source: ${h.file}:${h.line} */\n`;
  out += `${h.ruleText}\n\n`;
}

fs.writeFileSync(OUT, out, "utf8");

console.log(`✅ Snapshot written: ${path.relative(process.cwd(), OUT)}`);
console.log(`🔎 Scanned style files: ${styleFiles.length}`);
console.log(`🎯 Extracted rules: ${uniq.length}`);
