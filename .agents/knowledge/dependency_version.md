# Dependency Version Knowledge

## Yarn Catalogs

Granite keeps shared dependency versions in Yarn catalogs under `.yarnrc.yml`. Package manifests in root workspaces, `packages/*`, `infra/*`, and `docs` should use `catalog:<group>` when the dependency belongs to a shared catalog.

Catalog entries are fixed versions. Do not put semver ranges such as `^`, `~`, or `*` in `.yarnrc.yml` catalogs.

Current catalog groups:

- `brick-module` contains the shared `brick-module` version.
- `rn84` contains React Native 0.84 runtime, React 19.2, React Navigation, React Native community packages, and React Native-owned Babel packages such as `@react-native/babel-preset`.
- `rn84-hermes` contains Hermes parser packages that are coupled to the React Native 0.84 toolchain.
- `babel` contains Babel core, Babel presets, Babel runtime, `@babel/types`, and `@types/babel__*` packages that are not React Native-owned.
- `swc` contains `@swc/core` and `@swc/helpers`.
- `tools` contains shared static tooling such as TypeScript, `tsdown`, `tsup`, `tsx`, Vitest, Jest, ESLint, `esbuild`, `rimraf`, and Node/Jest types.

When a static tool or type package is used by multiple repository packages, prefer adding a fixed catalog entry and using `catalog:tools` in the relevant workspace manifests. Keep package-specific or single-use dependencies as direct versions unless they become shared enough to catalog.

## Manifest Rules

Workspace package manifests may use catalog references for shared dependencies:

- Use `catalog:rn84` for React, React Native, and React Native ecosystem versions tied to RN 0.84.
- Use `catalog:rn84-hermes` for `babel-plugin-syntax-hermes-parser` and direct `hermes-parser` dependencies.
- Use `catalog:babel` for Babel core/runtime/preset/type packages that are managed independently from React Native.
- Use `catalog:swc` for SWC runtime/compiler packages.
- Use `catalog:tools` for common build, test, lint, and typecheck tooling.

Peer dependency ranges describe compatibility and should stay as compatibility ranges or wildcards when that is the published contract. Do not force a catalog reference into a peer dependency just to reuse a version.

Root `package.json` `resolutions` are Yarn overrides, not normal dependency declarations. Keep fixed values there aligned with the corresponding catalog value when they override a catalog-managed package. Do not assume `catalog:<group>` is valid in `resolutions`; use the fixed version when Yarn does not support catalog resolution in that field.

After changing `.yarnrc.yml` catalogs or any catalog-consuming `package.json`, run `yarn install` and keep the generated `yarn.lock` changes.

## No-Catalog Areas

`packages/create-granite-app/templates/**/package.json` files must not use `catalog:` versions. These templates are copied into generated apps that are expected to work outside the Granite monorepo catalog setup.

`services/**/package.json` files must not use `catalog:` versions. Services are app/testbed workspaces and should keep explicit dependency versions even when they mirror catalog values.

Package example apps under package-local `example/` folders should also avoid catalog references when they are intended to behave like standalone sample apps.

When a no-catalog area needs the same version as a catalog-managed dependency, copy the current fixed catalog value into that package manifest instead of using `catalog:<group>`.

## Verification

Use these checks after dependency version changes:

- `yarn install` verifies Yarn can resolve catalogs and regenerates `yarn.lock`.
- `yarn check-app-catalogs` verifies `packages/create-granite-app/templates/**/package.json` and `services/**/package.json` do not contain `catalog:` values; it does not currently scan package-local `example/` manifests.
- Manually scan touched package-local `example/` manifests when they are part of a dependency version change.
- Manually verify every `catalog:<group>` package name exists in the matching `.yarnrc.yml` catalog.
- `git diff --check` should pass before committing.
