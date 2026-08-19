#!/bin/bash
# SessionStart (matcher "compact"): depois que a compactação zera a janela
# de contexto, injeta a instrução de reler o código real e atualizar os
# arquivos de contexto existentes antes de seguir com qualquer tarefa nova.

cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "A janela de contexto foi compactada. Antes de continuar qualquer tarefa nova: releia o código atual do projeto (prisma/schema.prisma, src/app/, README.md) e compare com os arquivos de contexto existentes (CLAUDE.md, .ai/context/project-overview.md, .ai/context/current-state.md, .ai/memory/decisions.md). Atualize esses arquivos com o que mudou desde a última atualização (código implementado, decisões novas, pendências resolvidas ou criadas), editando os arquivos existentes em vez de criar novos. Só depois disso continue o trabalho normalmente."
  }
}
EOF
exit 0
