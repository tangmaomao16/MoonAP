import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { TEMP_ROOT } from "./config.mjs";
import { getCompilerPlan, renderMainPackageFile } from "./compiler-plan.mjs";

function mainPackageJson(artifact = {}) {
  const exportsList = Array.isArray(artifact?.wasmExports)
    ? artifact.wasmExports.filter((name) => typeof name === "string" && name.trim().length > 0)
    : [];
  return renderMainPackageFile(exportsList);
}

async function ensureTemplateFiles(projectDir) {
  const plan = getCompilerPlan();
  await fs.mkdir(path.join(projectDir, "cmd", "main"), { recursive: true });
  for (const file of plan.templateFiles) {
    await writeProjectFile(projectDir, file.path, file.content);
  }
}

async function writeMainPackageFile(projectDir, artifact) {
  await fs.writeFile(path.join(projectDir, "cmd", "main", "moon.pkg"), mainPackageJson(artifact), "utf8");
}

async function ensureDirectoryPackageFile(projectDir, relativeDir) {
  const normalizedDir = String(relativeDir || "").replaceAll("/", path.sep);
  const pkgPath = path.join(projectDir, normalizedDir, "moon.pkg");
  try {
    await fs.access(pkgPath);
  } catch {
    await fs.writeFile(pkgPath, getCompilerPlan().generatedPackageFileContent, "utf8");
  }
}

async function writeProjectFile(projectDir, relativePath, content) {
  const normalizedPath = String(relativePath || "").replaceAll("/", path.sep);
  const outputPath = path.join(projectDir, normalizedPath);
  const resolvedRoot = path.resolve(projectDir);
  const resolvedPath = path.resolve(outputPath);

  if (!resolvedPath.startsWith(resolvedRoot)) {
    throw new Error(`Refused to write file outside generated project: ${relativePath}`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content, "utf8");
}

async function writeArtifactFiles(projectDir, artifact) {
  const sourceFiles = Array.isArray(artifact?.sourceFiles) ? artifact.sourceFiles : [];

  if (sourceFiles.length > 0) {
    for (const file of sourceFiles) {
      if (!file?.path || typeof file.content !== "string") {
        continue;
      }
      await writeProjectFile(projectDir, file.path, file.content);
    }
    return;
  }

  if (!artifact?.moonbitCode) {
    throw new Error("MoonAP compiler did not receive moonbitCode or sourceFiles.");
  }

  await writeProjectFile(projectDir, path.join("cmd", "main", "main.mbt"), artifact.moonbitCode);
}

async function ensureGeneratedPackageFiles(projectDir, artifact) {
  const sourceFiles = Array.isArray(artifact?.sourceFiles) ? artifact.sourceFiles : [];
  const packageDirs = new Set();
  const excludedDirs = new Set(getCompilerPlan().packageDirsExcludedFromAutofill);

  for (const file of sourceFiles) {
    if (!file?.path || !String(file.path).endsWith(".mbt")) continue;
    const normalizedPath = String(file.path).replaceAll("\\", "/");
    const dir = path.posix.dirname(normalizedPath);
    if (dir && dir !== "." && !excludedDirs.has(dir)) {
      packageDirs.add(dir);
    }
  }

  for (const dir of packageDirs) {
    await ensureDirectoryPackageFile(projectDir, dir);
  }
}

function runMoonBuild(projectDir) {
  const plan = getCompilerPlan();
  return new Promise((resolve, reject) => {
    const child = spawn("moon", plan.buildArgs, {
      cwd: projectDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`moon build failed with code ${code}\n${stdout}\n${stderr}`));
    });
  });
}

export async function compileMoonBitToWasm(artifact) {
  await fs.mkdir(TEMP_ROOT, { recursive: true });
  const projectDir = await fs.mkdtemp(path.join(TEMP_ROOT, `${os.platform()}-`));
  await ensureTemplateFiles(projectDir);
  await writeArtifactFiles(projectDir, artifact);
  await ensureGeneratedPackageFiles(projectDir, artifact);
  await writeMainPackageFile(projectDir, artifact);
  const logs = await runMoonBuild(projectDir);
  const wasmPath = path.join(projectDir, ...getCompilerPlan().wasmOutputPath.split("/"));
  const wasmBuffer = await fs.readFile(wasmPath);

  return {
    projectDir,
    wasmBase64: wasmBuffer.toString("base64"),
    buildLog: [logs.stdout.trim(), logs.stderr.trim()].filter(Boolean).join("\n"),
  };
}
