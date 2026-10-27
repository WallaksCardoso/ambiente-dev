# Ambiente Dev

Documentação do meu ambiente de desenvolvimento (Docker, Kafka e Swagger), escrita no Notion e
publicada automaticamente como site no GitHub Pages.

![Node.js](https://img.shields.io/badge/Node.js-22-informational)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Jekyll-informational)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-informational)](LICENSE)

**Site:** <https://wallakscardoso.github.io/ambiente-dev/>

## Sobre

Escrever no Notion é rápido; ter a mesma documentação versionada e pública no GitHub é útil. Este
repositório faz a ponte: um script lê uma página do Notion, separa as seções e gera um arquivo
Markdown para cada uma em `docs/`. Uma GitHub Action roda o script todo dia e publica as mudanças, e
o GitHub Pages monta o site com o tema Just the Docs.

## Funcionalidades

- Leitura da página do Notion pela API oficial
- Conversão para Markdown com limpeza de blocos de código e linhas em branco
- Uma página do site para cada seção marcada no Notion; seções apagadas no Notion saem do site
- Sincronização diária automática (e manual quando quiser)
- Commit só quando há mudança de conteúdo

## Como funciona

Na página do Notion, cada seção começa com um título no formato `::: NOME`:

```
## ::: DOCKER
conteúdo...

## ::: KAFKA
conteúdo...
```

Cada seção vira `docs/Ambiente-Dev/NOME.md`, com o cabeçalho que o Jekyll usa para montar o menu.

## Stack

- Node.js 22
- `@notionhq/client` e `notion-to-md`
- GitHub Actions (agendada) e GitHub Pages com Jekyll (Just the Docs)

## Como rodar

Pré-requisitos: Node.js 22 e uma
[integração interna do Notion](https://www.notion.so/my-integrations) com acesso à página.

```bash
npm install
NOTION_TOKEN=... NOTION_PAGE_ID=... npm run sync
```

| Variável | Descrição |
| --- | --- |
| `NOTION_TOKEN` | Token da integração interna do Notion |
| `NOTION_PAGE_ID` | ID da página que será sincronizada |

## Automação

O workflow `.github/workflows/notion-sync.yml` roda todo dia às 12h (UTC) e pode ser disparado à mão
em **Actions**. Ele precisa dos dois valores acima cadastrados como secrets do repositório em
**Settings > Secrets and variables > Actions**. Sem eles, o workflow termina sem fazer nada.

## Estrutura

```
scripts/sync-notion.js   leitura do Notion e geração dos arquivos
docs/                    site publicado no GitHub Pages
  _config.yml            configuração do Jekyll
  index.md               página inicial
  Ambiente-Dev/          uma página por seção do Notion
```

## Licença

[MIT](LICENSE)
