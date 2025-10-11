import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function syncPage() {
  console.log("Conectando ao Notion...");
  const pageId = process.env.NOTION_PAGE_ID;

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdResult = n2m.toMarkdownString(mdBlocks);

    fs.mkdirSync("debug", { recursive: true });
    fs.writeFileSync("debug/notion-return.json", JSON.stringify(mdResult, null, 2));
    console.log("Arquivo salvo → debug/notion-return.json");

    let markdownContent = "";
    if (typeof mdResult === "string") markdownContent = mdResult;
    else if (Array.isArray(mdResult)) markdownContent = mdResult.map((b) => b.parent || "").join("\n");
    else if (mdResult && typeof mdResult === "object")
      markdownContent = mdResult.parent
        ? String(mdResult.parent)
        : JSON.stringify(mdResult, null, 2);
    else markdownContent = String(mdResult);

    fs.mkdirSync("docs", { recursive: true });
    markdownContent += `\n\n<!-- sync: ${new Date().toISOString()} -->\n`;

    const filePath = "docs/ambiente-dev.md";
    fs.writeFileSync(filePath, markdownContent, "utf8");

    console.log("Markdown exportado →", filePath);
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
    console.log("Log salvo → debug/notion-error.json");
  } finally {
    process.exit(0);
  }
}

syncPage();
