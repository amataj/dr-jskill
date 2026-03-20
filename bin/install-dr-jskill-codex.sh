#!/usr/bin/env sh
# Install dr-jskill into Codex skills from GitHub (amataj/dr-jskill).
# Usage: ./scripts/install-dr-jskill-codex.sh [-b <branch> | -c] [--force]
#   -b <branch>  Branch to clone (default: main).
#   -c           Install from the current local project copy (no git clone).
#   --force      Remove existing ~/.codex/skills/dr-jskill and reinstall.

set -e

REPO_URL="https://github.com/amataj/dr-jskill.git"
BRANCH="main"
SKILL_NAME="dr-jskill"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
SKILLS_DIR="$CODEX_HOME/skills"
TARGET="$SKILLS_DIR/$SKILL_NAME"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

FORCE=""
USE_CURRENT_COPY=""
EXPLICIT_BRANCH=""
while [ $# -gt 0 ]; do
  case "$1" in
    -b)
      shift
      if [ -z "${1:-}" ]; then
        echo "Error: -b requires a branch name"
        exit 1
      fi
      BRANCH="$1"
      EXPLICIT_BRANCH=1
      shift
      ;;
    -c)
      USE_CURRENT_COPY=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [-b <branch> | -c] [--force]"
      exit 1
      ;;
  esac
done

if [ -n "$USE_CURRENT_COPY" ] && [ -n "$EXPLICIT_BRANCH" ]; then
  echo "Error: use either -b <branch> or -c, not both."
  exit 1
fi

if [ -d "$TARGET" ]; then
  if [ -n "$FORCE" ]; then
    echo "Removing existing $TARGET..."
    rm -rf "$TARGET"
  else
    echo "Skill already installed at $TARGET"
    echo "Use --force to remove and reinstall."
    exit 1
  fi
fi

mkdir -p "$SKILLS_DIR"

if [ -n "$USE_CURRENT_COPY" ]; then
  echo "Installing dr-jskill from current local copy: $REPO_ROOT"
  mkdir -p "$TARGET"
  cp -R "$REPO_ROOT"/. "$TARGET"/
else
  if ! command -v git >/dev/null 2>&1; then
    echo "Error: git is required to install the skill from GitHub."
    exit 1
  fi

  echo "Installing dr-jskill from $REPO_URL (branch: $BRANCH) into Codex skills..."
  git clone --branch "$BRANCH" --single-branch --depth 1 "$REPO_URL" "$TARGET"
fi

echo ""
echo "Done. dr-jskill is installed at $TARGET"
echo "Restart Codex to pick up the new skill."
