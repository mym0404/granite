# Util Selection Knowledge

이 문서는 Granite에서 새 코드를 작성할 때 어떤 라이브러리와 helper를 우선 선택할지 정리한다.

바로 옆 코드의 기존 패턴을 먼저 확인하되, 같은 역할에 여러 선택지가 있으면 아래 기준을 우선한다. generated, vendored, build output, cache 코드는 선택 기준으로 일반화하지 않는다.

## General Rules

- Node 파일·경로 작업은 Node core `fs`, `fs/promises`, `path`, `node:*` 모듈을 먼저 쓴다.
- repo package root와 `.granite` 작업 디렉터리는 `@granite-js/utils`의 `getPackageRoot()`, `prepareLocalDirectory()`, `getLocalTempDirectoryPath()`를 우선 쓴다.
- JS/TS subprocess 실행은 plugin package를 제외하고 `zx`의 `$`를 쓴다.
- plugin, RN runtime, native package, docs/service는 서로 다른 실행 경계다. 한 경계의 도구를 다른 경계에 무리하게 옮기지 않는다.
- `packages/mpack/src/vendors/**`, `dist`, `.granite`, `.swc`, `.vitest`, `coverage`, generated `router.gen.ts`, native typegen 출력은 기준에서 제외한다.

## Selection Guide

| 역할 | 우선 선택 |
| --- | --- |
| Granite-owned public CLI | Commander |
| interactive prompt | `@clack/prompts` |
| root internal CLI | 수동 `process.argv` parser 또는 shell `$1` |
| config loading | `packages/plugin-core`의 `loadConfig()`와 `c12` |
| config schema | `zod` |
| deployment/S3 JSON schema | `valibot` |
| route param validation | `@standard-schema/spec` 계약과 함수 validator |
| process execution in JS/TS | `zx`의 `$` |
| workspace graph | `@nx/devkit#createProjectGraphAsync()` |
| workspace list | `yarn workspaces list --json` 출력 파싱 |
| template workspace lookup | `workspace-tools#getYarnWorkspaces()`, `findWorkspacePath()` |
| file traversal | Node `fs`; watcher는 `chokidar`; vendored dts copy는 `fast-glob` |
| package/module resolution | `require.resolve(request, { paths })`; ESM 경계는 `createRequire()` |
| case conversion | `es-toolkit`의 `kebabCase`, `pascalCase` |
| simple package merge | `es-toolkit#merge` |
| plugin config merge | 도메인별 직접 merge 함수 |
| zip read | `yauzl` |
| gzip stream | Node stream과 `zlib.createGzip()` |
| RN package build | `react-native-builder-bob`, `tsc`, package-local scripts |
| Brick native bridge | `brick-module`, `brick-codegen` |
| RN Codegen bridge | `codegenNativeComponent`, `codegenNativeCommands`, `TurboModuleRegistry` |
| docs config | VitePress `defineConfig`, Node `createRequire`, `require.resolve`, `path` |
| service page discovery | `require.context('./pages')` |

## Area Notes

- Root JS/TS scripts run Yarn, Nx, `tsx`, `node`, `rimraf`, and package-local tools through repo scripts; subprocesses use `zx`.
- Owned public CLI packages use Commander for argument and command parsing.
- `packages/cli` owns public Granite commands and should not reimplement config loading outside `@granite-js/plugin-core/loadConfig`.
- `packages/create-granite-app` uses Commander for arguments, `@clack/prompts` for missing values, Node FS for template copy, and `es-toolkit#merge` for package JSON merge.
- Plugin packages keep their local execution patterns unless the task explicitly includes plugin migration.
- `packages/plugin-core` is the config loading, validation, and merge source of truth.
- `packages/plugin-router` uses `chokidar` for file watch and `@swc/core#parseFileSync()` for route export inspection.
- `packages/mpack` uses Node FS/path/resolve APIs, `enhanced-resolve`, and `es-toolkit`; test and fixture subprocesses use `zx`.
- `packages/react-native` should avoid Node FS/process tooling in runtime code; route files come from `require.context()`.
- `packages/utils` provides shared filesystem helpers and zip reading helpers.
- RN native packages generally rely on package build tools, Codegen, Brick, Podspec, and platform JSON APIs rather than repo-level Node tooling.
- `infra/*` uses AWS SDK/Pulumi libraries for cloud boundaries and `valibot` for deployment input/state validation.
- `docs` and `services` should mostly delegate behavior to package scripts, VitePress, Granite, Vitest/Jest, TypeScript, and Biome.

## Warning Signals

These are current-state mismatches. Report them before changing behavior and ask how to consolidate.

### Cross-Cutting

- Process execution is intentionally split by boundary: JS/TS uses `zx`, and shell scripts use shell.
- Workspace discovery is split across `@granite-js/utils`, `workspace-tools`, `@nx/devkit`, `yarn workspaces list --json`, and mpack custom detection.
- File traversal is split across Node FS, `chokidar`, and `fast-glob`; do not consolidate without checking runtime and watcher needs.
- Sync and async FS both exist intentionally in cache, generated artifact, and plugin setup paths.
- Schema validation is split by domain: `zod` for plugin config, `valibot` for deployment data, Standard Schema for route params.
- Deletion/cleanup is split across package scripts and Node FS helpers; check package ownership before changing.

### Package-Specific

- `packages/plugin-hermes` and `packages/cli` both compile Hermes bytecode but use different resolver assumptions.
- `packages/plugin-micro-frontend` uses filesystem paths in generated import strings; check Windows behavior before copying that pattern.
- `packages/plugin-router` and `packages/create-granite-app` both do template replacement.
- `packages/native` `sync-packages` export-map validation does not match the current subpath export structure.
- `packages/mpack` has custom workspace root detection for PnP, npm/yarn workspaces, and pnpm workspaces.
- `packages/vitest` intentionally mixes sync and async FS for transform cache behavior.
- Some package manifests declare dependencies that current source imports do not show; verify before removing because scripts, generated code, or package exports may still need them.
- Native provider behavior can differ by platform; do not assume Android and iOS expose the same flags, provider names, or serialization shape.
- Services use Biome in package scripts while root lint remains ESLint.
