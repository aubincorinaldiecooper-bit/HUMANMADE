import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const fail = (message) => {
  console.error(`[Beautiful UI policy] FAIL: ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`[Beautiful UI policy] PASS: ${message}`);
const read = (path) => readFileSync(join(root, path), "utf8");

const requiredFiles = [
  "AGENTS.md",
  "beautiful-ui.manifest.json",
  "UI_EXCEPTIONS.md",
  "app/globals.css",
  "components/SmartWearStudio.tsx",
  "components/atoms/Button.tsx",
  "components/atoms/SegmentedControl.tsx",
  "components/atoms/Switch.tsx",
  "components/atoms/StatusPill.tsx",
  "components/primitives/GlideMenu.tsx",
  "lib/utils.ts",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) fail(`required file is missing: ${file}`);
}
if (process.exitCode) process.exit(process.exitCode);

const policy = read("AGENTS.md");
const manifest = JSON.parse(read("beautiful-ui.manifest.json"));
const exceptions = read("UI_EXCEPTIONS.md");
const globals = read("app/globals.css");
const studio = read("components/SmartWearStudio.tsx");
const pkg = JSON.parse(read("package.json"));

if (!policy.includes("BEAUTIFUL_UI_HARD_RULE_V1")) fail("root AGENTS.md does not contain the hard-rule marker");
else pass("root agent policy is present");

if (manifest.policy_version !== "BEAUTIFUL_UI_HARD_RULE_V1") fail("manifest policy version does not match");
if (manifest.source_repository !== "https://github.com/slev12397/beautiful-ui") fail("Beautiful UI source repository changed");
if (manifest.source_commit !== "44a274e598395ab61e7c96c26fda2758780253b7") fail("Beautiful UI source commit changed without updating the hard rule");
else pass(`Beautiful UI source is pinned at ${manifest.source_commit.slice(0, 12)}`);

if (!pkg.dependencies?.["lucide-react"]) fail("lucide-react must remain the approved icon library");
if (Object.keys(pkg.dependencies ?? {}).some((name) => name.includes("central-icons"))) fail("paid Central Icons dependency is not allowed");
else pass("Lucide is present and Central Icons is absent");

const gitBlobSha = (content) => {
  const body = Buffer.from(content);
  return createHash("sha1")
    .update(Buffer.from(`blob ${body.length}\0`))
    .update(body)
    .digest("hex");
};

for (const item of manifest.vendored_exact_files) {
  const content = read(item.path);
  const actual = gitBlobSha(content);
  if (actual !== item.git_blob_sha) {
    fail(`${item.path} drifted from the pinned Beautiful UI source; adapt by composition/wrapper or explicitly update provenance`);
  } else {
    pass(`${item.path} matches pinned Beautiful UI source`);
  }
}

const foundationMarkers = [
  "Beautiful UI — design tokens",
  "@import \"tailwindcss\"",
  "@import \"shadow-plugin/unprefixed\"",
  "SMARTWEAR PRODUCT LAYER",
];
for (const marker of foundationMarkers) {
  if (!globals.includes(marker)) fail(`Beautiful UI foundation marker missing from app/globals.css: ${marker}`);
}
if (!process.exitCode) pass("Beautiful UI foundation plus Smartwear product layer is present");

const requiredImports = [
  '@/components/atoms/Button',
  '@/components/atoms/SegmentedControl',
  '@/components/atoms/StatusPill',
  '@/components/atoms/Switch',
  '@/components/primitives/GlideMenu',
];
for (const source of requiredImports) {
  if (!studio.includes(source)) fail(`SmartWearStudio is not using required Beautiful UI source: ${source}`);
}
if (!process.exitCode) pass("SmartWearStudio composes the required Beautiful UI atoms/primitives");

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(join(root, dir))) {
    const full = join(root, dir, name);
    const rel = relative(root, full);
    if (statSync(full).isDirectory()) out.push(...walk(rel));
    else if (/\.(ts|tsx|css|js|mjs)$/.test(name)) out.push(rel);
  }
  return out;
};

for (const file of ["app", "components", "lib"].flatMap(walk)) {
  const content = read(file);
  if (content.includes("@central-icons-react")) fail(`Central Icons import found in ${file}`);
}

const exceptionLines = exceptions
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("- ") && line !== "- None.");
if (exceptionLines.length) {
  fail("UI_EXCEPTIONS.md contains an exception. Explicit user approval and policy review are required before completion.");
} else {
  pass("no UI exceptions are authorized");
}

if (process.exitCode) {
  console.error("\nBeautiful UI policy verification failed. Do not claim the frontend task is complete.");
  process.exit(process.exitCode);
}

console.log("\nBeautiful UI policy verification passed.");
