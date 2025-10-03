"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import "highlight.js/styles/github-dark.css";

const docsConfig = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Installation, setup, and running Hawk",
    file: "GETTING_STARTED.md",
  },
  {
    id: "slack",
    title: "Slack Notifications",
    description: "Configure Slack webhooks for alerts",
    file: "SLACK.md",
  },
  {
    id: "github-oauth",
    title: "GitHub OAuth",
    description: "Enable GitHub authentication",
    file: "GITHUB_OAUTH.md",
  },
];

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const params = await searchParams;
  const selectedDocParam = params.doc ?? "getting-started";

  return <DocsContent selectedDocParam={selectedDocParam} />;
}

function DocsContent({ selectedDocParam }: { selectedDocParam: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const selectedDoc = selectedDocParam;

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      try {
        const doc = docsConfig.find((d) => d.id === selectedDoc);
        if (!doc) {
          setContent("# Documentation not found\n\nThe requested documentation could not be found.");
          return;
        }

        const response = await fetch(`/docs-content/${doc.file}`);
        if (!response.ok) {
          throw new Error("Failed to load documentation");
        }
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error loading documentation:", error);
        setContent("# Error loading documentation\n\nPlease try again later.");
      } finally {
        setLoading(false);
      }
    };

    void loadDoc();
  }, [selectedDoc]);

  useEffect(() => {
    // Add copy buttons to code blocks after content loads
    if (!loading && content) {
      const timer = setTimeout(() => {
        const codeBlocks = document.querySelectorAll("pre code");
        codeBlocks.forEach((block) => {
          const pre = block.parentElement;
          if (pre && !pre.querySelector(".copy-button")) {
            const button = document.createElement("button");
            button.className = "copy-button";
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
            button.onclick = async () => {
              const code = block.textContent ?? "";
              await navigator.clipboard.writeText(code);
              button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              `;
              setTimeout(() => {
                button.innerHTML = `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                `;
              }, 2000);
            };
            pre.style.position = "relative";
            pre.appendChild(button);
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  const currentDoc = docsConfig.find((d) => d.id === selectedDoc) ?? docsConfig[0]!;

  return (
    <div className="flex h-full flex-col gap-4">
      <style jsx global>{`
        pre {
          position: relative;
        }
        .copy-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.25rem;
          color: inherit;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        pre:hover .copy-button {
          opacity: 1;
        }
        .copy-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <div className="flex items-center gap-2">
        <IconBook className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Documentation</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2 lg:sticky lg:top-4 lg:self-start">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contents
          </h2>
          <nav className="space-y-1">
            {docsConfig.map((doc) => (
              <Link
                key={doc.id}
                href={`/app/docs?doc=${doc.id}`}
                className="block"
              >
                <Button
                  variant={selectedDoc === doc.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                >
                  <div className="flex flex-1 flex-col items-start gap-0.5">
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.description}
                    </span>
                  </div>
                  {selectedDoc === doc.id && (
                    <IconChevronRight className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentDoc.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <article className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
