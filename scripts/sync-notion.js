import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const PAGE_MARKER = /^#{0,3}\s*:::\s*(.+)$/m;

async function syncPage() {
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

    const generatedFiles = [];

    for (const sec of sections) {
      const safeName = sec.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      const filePath = `${basePath}/${safeName}.md`;
      const content = `# ${sec.title}\n\n${sec.content.join("\n").trim()}\n`;
      fs.writeFileSync(filePath, content, "utf8");
      generatedFiles.push(filePath);
    }

    const existingFiles = fs
      .readdirSync(basePath)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => path.join(basePath, f));

    for (const file of existingFiles) {
      if (!generatedFiles.includes(file)) {
        fs.unlinkSync(file);
        console.log("Removido:", file);
      }
    }

    const index = sections
      .map(
        (sec) =>
          `- [${sec.title}](./${sec.title
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")}.md)`
      )
      .join("\n");

    fs.writeFileSync("docs/README.md", "# Ambiente Dev\n\n" + index + "\n", "utf8");
  } catch (err) {
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
