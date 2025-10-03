import { type NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const ALLOWED_FILES = [
  "GETTING_STARTED.md",
  "SLACK.md",
  "GITHUB_OAUTH.md",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  try {
    const fileName = params.file;

    // Security: only allow specific files
    if (!ALLOWED_FILES.includes(fileName)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = join(process.cwd(), "docs", fileName);
    const content = await readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error reading documentation file:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
