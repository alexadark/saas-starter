#!/bin/bash
# RIFF Commit Message Format Enforcer
# Install: cp to .git/hooks/commit-msg && chmod +x
#
# Valid formats:
#   riff(phase-N/task-M): description
#   riff(quick): description
#   riff(debug): description
#   riff(init): description
#   riff(start): description
#
# Also allows non-riff commits (manual work, deps, etc.)
# but warns if in a RIFF project with an active phase

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if this is a RIFF project
if [ ! -d ".planning" ]; then
  # Not a RIFF project - allow any commit
  exit 0
fi

# Valid RIFF patterns
RIFF_PATTERN='^riff\((phase-[0-9]+\/task-[0-9]+|quick|debug|init|start|fix)\):'

if echo "$COMMIT_MSG" | grep -qE "$RIFF_PATTERN"; then
  # Valid RIFF format
  exit 0
fi

# Check if there's an active phase (in-progress)
if [ -f "ROADMAP.yaml" ] && grep -q 'status: in-progress' ROADMAP.yaml 2>/dev/null; then
  echo -e "${YELLOW}RIFF WARNING: Active phase detected but commit doesn't follow RIFF format.${NC}"
  echo "Expected: riff(phase-N/task-M): description"
  echo "Got: $COMMIT_MSG"
  echo ""
  echo "Allowing commit, but this may indicate work outside the plan."
  # Warning only - don't block non-RIFF commits
  exit 0
fi

# No active phase - allow freely
exit 0
