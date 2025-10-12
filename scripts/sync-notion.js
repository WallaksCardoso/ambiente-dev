import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const PAGE_MARKER = /^\s*#{0,3}\s*:::\s*(.+)$/m;

function sanitizeMarkdown(md) {
  return md
    .replace(/```+\s*(plain\s?text|text|properties|xml)?\s+/g, "```$1\n") 
    .replace(/```(plain\s)?text/g, "```")
    .replace(/```xml\s+xml/g, "```xml")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function syncPage() {
  const pageId = process.env.NOTION_PAGE_ID;
  const basePath = "docs/Ambiente-Dev";

  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const mdResult = n2m.toMarkdownString(mdBlocks);

  fs.mkdirSync("debug", { recursive: true });
  fs.writeFileSync(
    "debug/notion-return.json",
    JSON.stringify({ blocks: mdBlocks, markdown: mdResult }, null, 2),
    "utf8"
  );

  let markdownContent = "";
  if (typeof mdResult === "string") markdownContent = mdResult;
  else if (Array.isArray(mdResult))
    markdownContent = mdResult.map((b) => b.parent || "").join("\n");
  else if (mdResult && typeof mdResult === "object")
    markdownContent = mdResult.parent
      ? String(mdResult.parent)
      : JSON.stringify(mdResult, null, 2);
  else markdownContent = String(mdResult);

  const sections = [];
  let current = null;
  for (const line of markdownContent.split("\n")) {
    const match = line.match(PAGE_MARKER);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), content: [] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);

  fs.mkdirSync(basePath, { recursive: true });

  const generated = new Set();

  for (const sec of sections) {
    const safeName = sec.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const filePath = path.join(basePath, `${safeName}.md`);

    const cleaned = sanitizeMarkdown(sec.content.join("\n").trim());

    const content = `---
layout: default
title: "${sec.title.replace(/"/g, "'")}"
nav_order: 2
---

# ${sec.title}

${cleaned}
`;

    fs.writeFileSync(filePath, content, "utf8");
    generated.add(`${safeName}.md`);
    console.log("Gerado:", safeName);
  }

  const existing = fs.readdirSync(basePath).filter((f) => f.endsWith(".md"));
  for (const file of existing) {
    if (!generated.has(file)) {
      fs.unlinkSync(path.join(basePath, file));
      console.log("Removido:", file);
    }
  }

  const indexContent = `---
layout: default
title: "Início"
nav_order: 1
nav_exclude: true
---

${sections
  .map((sec) => {
    const safeName = sec.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `- [${sec.title}](./Ambiente-Dev/${safeName}.html)`;
  })
  .join("\n")}
`;

  fs.writeFileSync("docs/index.md", indexContent, "utf8");
  console.log("✅ Index atualizado → docs/index.md");

  process.exit(0);
}

syncPage();
