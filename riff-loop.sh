#!/bin/bash
# RIFF Loop - Unattended execution (Ralph loop)
#
# Spawns a fresh Claude Code agent per iteration.
# Each iteration: reads state from disk, picks next AFK task, executes /riff:next.
# Stops on: verification failure, R3 deviation, security issue, all done, or error.
#
# Usage:
#   ./riff-loop.sh [options] [project-path]
#   ./riff-loop.sh -n 1                    # loop once (test a single iteration)
#   ./riff-loop.sh -n 3 ./myapp            # 3 iterations on ./myapp
#   ./riff-loop.sh                          # default: up to 20 iterations in current dir
#
# Options:
#   -n <count>   Maximum number of iterations (overrides RIFF_MAX_ITERATIONS)
#
# Prerequisites:
#   - Claude Code CLI installed and authenticated
#   - RIFF framework initialized in the project (/riff:init done)
#   - ROADMAP.yaml exists with phases
#   - Telegram bot configured for notifications (optional, see README)
#
# Environment variables:
#   RIFF_TELEGRAM_BOT_TOKEN  - Telegram bot token for notifications
#   RIFF_TELEGRAM_CHAT_ID    - Telegram chat ID for notifications
#   RIFF_MAX_ITERATIONS      - Maximum loop iterations (default: 20, safety limit)
#   RIFF_COOLDOWN            - Seconds between iterations (default: 5)

set -e

# Parse options
FLAG_ITERATIONS=""
while getopts "n:" opt; do
  case $opt in
    n) FLAG_ITERATIONS="$OPTARG" ;;
    *) echo "Usage: ./riff-loop.sh [-n iterations] [project-path]"; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

# Configuration
PROJECT_PATH="${1:-.}"
MAX_ITERATIONS="${FLAG_ITERATIONS:-${RIFF_MAX_ITERATIONS:-20}}"
COOLDOWN="${RIFF_COOLDOWN:-5}"
ITERATION=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Notification function
notify() {
  local message="$1"
  local level="${2:-info}" # info, warn, error, done

  echo -e "${BLUE}[RIFF Loop]${NC} $message"

  # Telegram notification
  if [ -n "$RIFF_TELEGRAM_BOT_TOKEN" ] && [ -n "$RIFF_TELEGRAM_CHAT_ID" ]; then
    local emoji=""
    case "$level" in
      info) emoji="🎸" ;;
      warn) emoji="⚠️" ;;
      error) emoji="🛑" ;;
      done) emoji="✅" ;;
    esac

    curl -s -X POST "https://api.telegram.org/bot${RIFF_TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${RIFF_TELEGRAM_CHAT_ID}" \
      -d "text=${emoji} RIFF: ${message}" \
      -d "parse_mode=Markdown" > /dev/null 2>&1 || true
  fi
}

# Display banner
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/templates/banner.sh"

# Check prerequisites
cd "$PROJECT_PATH"

if [ ! -f "ROADMAP.yaml" ]; then
  echo -e "${RED}Error: ROADMAP.yaml not found. Run /riff:init and /riff:start first.${NC}"
  exit 1
fi

if [ ! -d ".planning" ]; then
  echo -e "${RED}Error: .planning/ not found. Run /riff:init first.${NC}"
  exit 1
fi

notify "Starting RIFF loop in $(pwd)" "info"
notify "Max iterations: $MAX_ITERATIONS | Cooldown: ${COOLDOWN}s" "info"

# Main loop
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo -e "${GREEN}  RIFF Loop - Iteration $ITERATION/$MAX_ITERATIONS${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════${NC}"
  echo ""

  # Check if there are any AFK todo phases
  AFK_TODO=$(grep -c 'mode: AFK' ROADMAP.yaml 2>/dev/null || echo "0")
  TODO_COUNT=$(grep -c 'status: todo' ROADMAP.yaml 2>/dev/null || echo "0")

  if [ "$TODO_COUNT" -eq 0 ]; then
    notify "All phases complete! Build finished." "done"
    break
  fi

  # Check for blocked phases
  BLOCKED_COUNT=$(grep -c 'status: blocked' ROADMAP.yaml 2>/dev/null || echo "0")
  if [ "$BLOCKED_COUNT" -gt 0 ] && [ "$TODO_COUNT" -le "$BLOCKED_COUNT" ]; then
    notify "All remaining phases are blocked. Human intervention needed." "error"
    break
  fi

  # Check if only HITL phases remain (no AFK phases left to run)
  # Count todo phases that are AFK (the only ones the loop can execute)
  AFK_TODO_COUNT=$(grep -B5 'mode: AFK' ROADMAP.yaml 2>/dev/null | grep -c 'status: todo' || echo "0")
  if [ "$TODO_COUNT" -gt 0 ] && [ "$AFK_TODO_COUNT" -eq 0 ]; then
    notify "Only HITL phases remain. Human presence required for: auth, payment, or public API work." "warn"
    break
  fi

  # Run /riff:next in a fresh Claude Code instance
  # The agent reads state from disk, picks next AFK task, executes
  notify "Iteration $ITERATION: Running /riff:next..." "info"

  # Create a temporary prompt file for this iteration
  PROMPT_FILE=$(mktemp)
  cat > "$PROMPT_FILE" << 'RIFF_PROMPT'
You are running in RIFF loop (AFK mode). Execute /riff:next with these constraints:
- Only pick phases with mode: AFK
- On Confident/Likely assumptions: proceed without asking
- On Unclear assumptions: write "LOOP_STOP: unclear assumptions" to STATE.md and exit
- On R3 deviation: write "LOOP_STOP: R3 architecture change needed" to STATE.md and exit
- On verification FAIL: write "LOOP_STOP: verification failed" to STATE.md and exit
- On security CRITICAL/HIGH: write "LOOP_STOP: security issue" to STATE.md and exit
- After successful completion: exit normally
- Branch workflow: create branch riff/phase-N-slug, commit per task, create PR, squash merge, return to main
- Auto-merge PRs without waiting for review (AFK mode)
RIFF_PROMPT

  # Execute with Claude Code CLI
  # The agent handles: branch creation, task commits, PR creation, merge, return to main
  if claude -p "$(cat "$PROMPT_FILE")" --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Agent" 2>&1; then
    echo -e "${GREEN}Iteration $ITERATION: agent finished.${NC}"
  else
    notify "Iteration $ITERATION failed with error. Stopping loop." "error"
    rm -f "$PROMPT_FILE"
    # Ensure we're back on main even if the agent failed mid-branch
    MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
    git checkout "$MAIN_BRANCH" 2>/dev/null || true
    break
  fi

  rm -f "$PROMPT_FILE"

  # Ensure we're back on main after the agent's PR merge
  # The agent should have done this, but we verify as a safety net
  MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
  CURRENT_BRANCH=$(git branch --show-current)
  if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo -e "${YELLOW}Warning: agent left us on branch '$CURRENT_BRANCH'. Returning to $MAIN_BRANCH.${NC}"
    # If there are uncommitted changes, commit them before switching
    if [ -n "$(git status --porcelain)" ]; then
      git add --all -- . ':!.env*' ':!*.secret*'
      git commit -m "riff(loop-${ITERATION}): uncommitted changes from branch $CURRENT_BRANCH

Co-Authored-By: RIFF Loop <riff@automated>" || true
    fi
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH" 2>/dev/null || true
  fi

  # Check if the loop should stop
  if grep -q "LOOP_STOP" STATE.md 2>/dev/null; then
    STOP_REASON=$(grep "LOOP_STOP" STATE.md | head -1)
    notify "Loop stopped: $STOP_REASON" "warn"
    break
  fi

  # Check if all phases are now done
  REMAINING=$(grep -c 'status: todo' ROADMAP.yaml 2>/dev/null || echo "0")
  if [ "$REMAINING" -eq 0 ]; then
    notify "All phases complete! Build finished." "done"
    break
  fi

  # Cooldown between iterations
  if [ $ITERATION -lt $MAX_ITERATIONS ]; then
    echo -e "${BLUE}Cooldown: ${COOLDOWN}s before next iteration...${NC}"
    sleep "$COOLDOWN"
  fi
done

# Check for framework modifications
if [ -d ".riff" ] && [ -d ".riff/.git" ]; then
  RIFF_CHANGES=$(cd .riff && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  if [ "$RIFF_CHANGES" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Framework Changes Pending Review${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
    echo ""
    (cd .riff && git status --short)
    echo ""
    echo -e "${YELLOW}Review:  cd .riff && git diff${NC}"
    echo -e "${YELLOW}Accept:  cd .riff && git add -A && git commit -m \"learn: description\" && git push${NC}"
    echo -e "${YELLOW}Discard: cd .riff && git checkout .${NC}"
    echo ""
    notify "Framework has $RIFF_CHANGES pending changes. Review before pushing." "warn"
  fi
fi

# Final status
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  RIFF Loop Complete${NC}"
echo -e "${GREEN}  Iterations: $ITERATION${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"

notify "Loop finished after $ITERATION iterations." "info"
