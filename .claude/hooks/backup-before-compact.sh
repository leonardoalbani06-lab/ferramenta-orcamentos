#!/bin/bash
# PreCompact: salva uma cópia do transcript da sessão antes da compactação
# (manual ou automática) apagar o histórico da janela de contexto.

JQ="/c/Users/leona/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"

mkdir -p "${CLAUDE_PROJECT_DIR}/.claude/backups"

INPUT="$(cat)"
TRANSCRIPT="$("$JQ" -r '.transcript_path // empty' <<< "$INPUT")"

if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
  cp "$TRANSCRIPT" "${CLAUDE_PROJECT_DIR}/.claude/backups/session-$(date +%Y%m%d-%H%M%S).jsonl"
fi

exit 0
