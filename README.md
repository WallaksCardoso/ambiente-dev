# ambiente-dev

Minhas anotações de ambiente (Docker, Kafka, Swagger) publicadas em
<https://wallakscardoso.github.io/ambiente-dev/>.

Escrevo no Notion porque é mais rápido, mas queria ter isso versionado e aberto. Um script lê a
página pela API do Notion e gera um Markdown por seção em `docs/`; uma GitHub Action roda todo dia e
o GitHub Pages monta o site com o tema Just the Docs.

Cada seção da página começa com um título `::: NOME` e vira `docs/Ambiente-Dev/NOME.md`:

```
## ::: DOCKER
conteúdo...
```

## Rodando o sync

Precisa de Node.js 22 e de uma [integração interna do Notion](https://www.notion.so/my-integrations)
com acesso à página.

```bash
npm install
NOTION_TOKEN=... NOTION_PAGE_ID=... npm run sync
```

Na Action (`.github/workflows/notion-sync.yml`), os dois valores ficam nos secrets do repositório.
Sem eles o workflow termina sem fazer nada. Também dá para disparar à mão pela aba Actions.

## Licença

MIT
