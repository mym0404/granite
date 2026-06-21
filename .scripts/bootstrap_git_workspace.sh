#!/usr/bin/env sh
set -eu

source_tree_path="$1"
worktree_path="$2"

copy_dir() {
  [ -d "$source_tree_path/$1" ] || return 0
  mkdir -p "$worktree_path/$1"
  cp -pR "$source_tree_path/$1/." "$worktree_path/$1/"
}

copy_file() {
  [ -f "$source_tree_path/$1" ] || return 0
  mkdir -p "$worktree_path/$(dirname "$1")"
  cp -p "$source_tree_path/$1" "$worktree_path/$1"
}

# Copy only portable caches; Nx workspace-data contains daemon state.
for path in \
  .yarn/cache \
  .yarn/unplugged \
  .nx/cache
do
  copy_dir "$path"
done

for path in \
  .yarn/install-state.gz \
  .pnp.cjs \
  .pnp.loader.mjs
do
  copy_file "$path"
done

cd "$worktree_path"

# Trust and install the toolchain declared by the worktree.
mise trust
mise install

# Keep Yarn's workspace wrappers on mise's Node.
PATH="$(dirname "$(mise which node)"):$(dirname "$(mise which yarn)"):$PATH"
export PATH

yarn install --immutable
NX_DAEMON=false yarn build:all
