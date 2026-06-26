# Verification Knowledge

## Environment Baseline

Local tool versions live in `mise.toml`; `.nvmrc` mirrors the Node version for local compatibility. The repo relies on mise for Node and Yarn rather than a committed `.yarn/releases` bundle. CI runs `jdx/mise-action@v4` in `.github/actions/setup-node-yarn/action.yml`, then installs dependencies with `yarn install --immutable`.

Codex app worktree setup lives in `.codex/environments/environment.toml` and delegates to `.scripts/bootstrap_git_workspace.sh`. The bootstrap script copies portable Yarn and Nx caches plus Yarn PnP files into the worktree, skips `.nx/workspace-data` because it contains daemon state, runs `mise trust`, `mise install`, `yarn install --immutable`, and `NX_DAEMON=false yarn build:all`.

Because Yarn Plug'n'Play is enabled, run commands through `yarn` from the relevant workspace instead of calling package binaries directly.

## Root Commands

- `yarn build:all` runs `nx run-many --targets=build`. CI runs this first and uploads build artifacts for later jobs.
- `yarn lint` runs `eslint .` with the root `eslint.config.cjs` ignore list.
- `yarn typecheck:all` runs `nx run-many -t typecheck`.
- `yarn test:all` runs `yarn test:parallel` and then `yarn test:no-parallel`.
- `yarn test:parallel` runs `nx run-many -t test --nxBail`.
- `yarn test:no-parallel` runs `nx run-many -t test:no-parallel --parallel=false --nxBail`.
- `yarn check-exports` runs `.scripts/check-exports.mts`; it exits early when `git diff origin/main --name-only` has no `package.json` change, otherwise it builds export-bearing workspaces and verifies package `main`, `module`, `bin`, `types`, and `exports` targets are included in `yarn pack --dry-run`.
- `yarn check-app-catalogs` runs `.scripts/check-no-app-catalog.ts`.
- `yarn generate-licenses` regenerates package `NOTICE` files from current workspace dependency metadata.
- `yarn check-licenses` checks generated license output.
- `yarn consistency-check-licenses` checks license consistency.

## Package-Scoped Commands

For narrow changes, prefer the smallest package workspace command that covers the touched package:

- TypeScript packages usually expose `yarn workspace <workspace-name> typecheck`.
- Packages with tests expose either `test` or `test:no-parallel`.
- Build tools vary by package: `tsdown`, `bob build`, TypeScript build configs, Granite build, or Gradle.
- Example Granite services use package-local `granite build` scripts.
- `packages/granite-screen` builds its Gradle plugin from `packages/granite-screen/gradle-plugin`.

Check the target package `package.json` before choosing the command.

## Docs Verification

Run docs commands from `docs/`:

- `yarn docs:build` builds the VitePress documentation site and is the command used by the docs deployment workflow.
- `yarn docs:dev` starts local VitePress development.
- `yarn docs:preview` previews the built VitePress site.

For markdown-only repository knowledge edits, browser validation is not needed. Reread changed markdown, verify routed paths exist, and confirm documented commands still exist.

## CI Coverage

`.github/workflows/integrations.yaml` runs on pushes to `main` and pull requests. The setup job installs with mise/Yarn, runs `yarn build:all`, caches Yarn package archives, Yarn PnP install state, and Nx cache separately, then uploads `packages/*/dist` as workflow artifacts. The artifact paths still include `tools/dist`, even though the root workspace list currently has no `tools` workspace, and they do not include `infra/*/dist`.

The integrations workflow also has a `changes` job that filters package manifest and license metadata changes. `lint` depends on setup and runs `yarn check-app-catalogs` before `yarn lint`. `license` runs only when package manifests, `yarn.lock`, or license scripts change. `package-exports` runs only when a `package.json` changes, fetches `origin/main`, and runs `yarn check-exports`. Typecheck and test jobs depend on setup and reuse build artifacts.

`.github/workflows/docs-workflow.yaml` builds the VitePress site and checks that `docs/.vitepress/dist/index.html` exists before deploying GitHub Pages.

`.github/workflows/release.yaml` runs `yarn build:all` on `main` before Changesets versioning or publishing.

## Blind Spots

Root CI does not run every docs preview path, native mobile runtime scenario, or cloud deployment path. For changes that affect React Native runtime behavior, native integration, AWS resources, or deployment workflows, add a focused package-level check and document any environment-dependent gap in the handoff.

Some commands depend on prior build output because Nx target defaults make tests and typechecks depend on upstream builds. If a local failure mentions missing `dist` output or declarations, run the required build target before changing logic.

CI package export validation is conditional on `package.json` changes. If a source or build-config change can affect packed files without touching a package manifest, run `yarn check-exports` manually.
