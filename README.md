#  Notion → Markdown Sync

Ferramenta para sincronizar páginas do **Notion** e gerar automaticamente arquivos `.md` organizados em pastas no repositório.  
Ideal para documentações vivas mantidas diretamente no Notion e publicadas automaticamente no GitHub.

---

##  Estrutura Final

Após a execução, o script gera a seguinte estrutura:

```
docs/
├── README.md
└── Ambiente Dev/
    ├── SWAGGER.md
    ├── DOCKER.md
    └── KAFKA.md
```

O `README.md` no diretório `docs` serve como índice principal para navegação entre os arquivos exportados.

---

##  Configuração Local

### 1. Instalar dependências

```
npm install @notionhq/client notion-to-md
```

---

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```
NOTION_TOKEN=seu_token_interno_do_notion
NOTION_PAGE_ID=id_da_pagina_raiz
```

O `NOTION_PAGE_ID` é o **UUID** da página principal do Notion (exemplo:  
`https://www.notion.so/Ambiente-Dev-xxxxxxxxxxxxxxxxxxxx`).

---

### 3. Estrutura esperada no Notion

No Notion, use o marcador `:::` para definir novas páginas dentro do conteúdo.  
Exemplo:

```
## ::: SWAGGER
conteúdo do swagger

## ::: DOCKER
conteúdo do docker

## ::: KAFKA
conteúdo do kafka
```

Cada seção `:::` será exportada como um arquivo `.md` separado.

---

##  Execução Manual

Execute o script manualmente:

```
node sync-notion.js
```

Os arquivos Markdown serão gerados automaticamente em `docs/Ambiente Dev`.

---

##  Atualização Manual

Sempre que o conteúdo for atualizado no Notion:

```
node sync-notion.js
```

Isso sobrescreve os arquivos `.md` com as versões mais recentes, mantendo a estrutura e o índice atualizados.

---

##  Automação com GitHub Actions

Também é possível **automatizar a sincronização** via **GitHub Actions**, para que o conteúdo seja atualizado de forma contínua no repositório.

### Estrutura do Workflow

Crie um arquivo `.github/workflows/sync-notion.yml` com o conteúdo abaixo:

```yaml
name: Sync Notion Docs

on:
  workflow_dispatch:
  schedule:
    - cron: "0 */6 * * *" # Executa a cada 6 horas

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Run Notion Sync
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_PAGE_ID: ${{ secrets.NOTION_PAGE_ID }}
        run: node sync-notion.js

      - name: Commit and push changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "Sync Notion → GitHub Docs [skip ci]" || echo "No changes"
          git push
```

---

###  Configurar os Tokens no GitHub

1. Vá em **Settings > Secrets and variables > Actions > New repository secret**
2. Adicione:
   - `NOTION_TOKEN` → Token de integração interno do Notion
   - `NOTION_PAGE_ID` → ID da página principal
3. O Action usará esses valores para se autenticar no Notion e atualizar os arquivos automaticamente.

---

##  Debug

Durante o processo (manual ou automatizado), o script gera logs e retornos brutos do Notion:

```
debug/
├── notion-return.json   → retorno bruto da API Notion
├── notion-error.json    → log de erros (se houver)
```

Esses arquivos ajudam a identificar problemas de autenticação ou formatação.

---

##  Exemplo de Uso

1. Configure o `.env` local ou os **Secrets** no GitHub.  
2. Execute `node sync-notion.js` localmente ou rode o workflow `Sync Notion Docs`.  
3. Verifique os arquivos gerados em `docs/Ambiente Dev`.  
4. O `README.md` dentro de `docs` lista todos os tópicos exportados com links diretos.

---

##  Dica

Você pode usar emojis ou ícones nos títulos das páginas Notion — eles serão mantidos nos arquivos `.md` e no índice final.  
E se quiser forçar uma atualização manual, basta rodar o workflow “**Run workflow**” no GitHub Actions.

---

##  Tecnologias Utilizadas

- [Node.js 20+](https://nodejs.org)
- [@notionhq/client](https://www.npmjs.com/package/@notionhq/client)
- [notion-to-md](https://www.npmjs.com/package/notion-to-md)
- [GitHub Actions](https://docs.github.com/en/actions)
