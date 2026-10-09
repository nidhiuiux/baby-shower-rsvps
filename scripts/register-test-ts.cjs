/* eslint-disable @typescript-eslint/no-require-imports */
// Compile the small server modules under test with the project's existing TypeScript dependency.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (specifier, parent, ...rest) {
  if (specifier.startsWith("@/")) specifier = path.join(__dirname, "../src", specifier.slice(2));
  return resolve.call(this, specifier, parent, ...rest);
};
Module._extensions[".ts"] = function (module, filename) {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
