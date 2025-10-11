import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const PAGE_MARKER = /^#{0,3}\s*:::\s*(.+)$/m;

async function syncPage() {
  console.log("Conectando ao Notion...");
  const pageId = process.env.NOTION_PAGE_ID;

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdResult = n2m.toMarkdownString(mdBlocks);

    fs.mkdirSync("debug", { recursive: true });
    fs.writeFileSync("debug/notion-return.json", JSON.stringify(mdResult, null, 2));

    let markdownContent = "";
    if (typeof mdResult === "string") markdownContent = mdResult;
    else if (Array.isArray(mdResult))
      markdownContent = mdResult.map((b) => b.parent || "").join("\n");
    else if (mdResult && typeof mdResult === "object")
      markdownContent = mdResult.parent
        ? String(mdResult.parent)
        : JSON.stringify(mdResult, null, 2);
    else markdownContent = String(mdResult);

    const lines = markdownContent.split("\n");
    const sections = [];
    let current = null;

    for (const line of lines) {
      const match = line.match(PAGE_MARKER);
      if (match) {
        if (current) sections.push(current);
        current = { title: match[1].trim(), content: [] };
      } else if (current) {
        current.content.push(line);
      }
    }
    if (current) sections.push(current);

    const basePath = "docs/Ambiente Dev";
    fs.mkdirSync(basePath, { recursive: true });

    for (const sec of sections) {
      const safeName = sec.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      const filePath = `${basePath}/${safeName}.md`;
      const content = `# ${sec.title}\n\n${sec.content.join("\n").trim()}\n`;
      fs.writeFileSync(filePath, content, "utf8");
      console.log("Gerado:", filePath);
    }

    const index = sections
      .map(
        (sec) =>
          `- [${sec.title}](./Ambiente%20Dev/${sec.title
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")}.md)`
      )
      .join("\n");

    const readmePath = "docs/MENU.md";
    const readmeContent = `# Ambiente Dev\n\n${index}\n`;
    fs.writeFileSync(readmePath, readmeContent, "utf8");

    console.log("Índice criado → docs/MENU.md");
  } catch (err) {
    console.error("Erro ao sincronizar com o Notion:", err.message);
    fs.mkdirSync("debug", { recursive: true });
    fs.writeFileSync(
      "debug/notion-error.json",
      JSON.stringify(
        { message: err.message, stack: err.stack, name: err.name },
        null,
        2
      ),
      "utf8"
    );
  } finally {
    process.exit(0);
  }
}

syncPage();
