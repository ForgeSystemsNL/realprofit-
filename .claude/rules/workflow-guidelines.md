# Workflow Guidelines

## Session Start
1. Read @context/me.md, @context/work.md, @context/current-priorities.md
2. Check @decisions/log.md for recent decisions
3. Ask what we're working on if not stated

## Session End
1. Fill out templates/session-summary.md
2. Update any context files that changed
3. Append new decisions to decisions/log.md

## File Placement
- Scripts → tools/scripts/
- Agents → tools/agents/
- Automation logic → workflows/
- Temp files → .tmp/
- Never create files in the root directory

## Work Style
- Think in systems — inputs, logic, outputs
- Reuse before rebuilding — check tools/ first
- Never overwrite a working file without confirmation
- Archive instead of delete

## Trigger → Action → Output
Structure all automations as: Trigger → Action → Output
