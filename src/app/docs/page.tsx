"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook, IconHome } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LandingHeader } from "@/components/nav/landing-header";
import { LandingFooter } from "@/components/nav/landing-footer";

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
    <>
      <LandingHeader isSignedIn={false} />
      <style jsx global>{`
        pre {
          position: relative;
          padding: 1rem;
          overflow-x: auto;
        }
        .copy-button {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.5rem;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        pre:hover .copy-button {
          opacity: 1;
        }
        .copy-button:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          border-color: hsl(var(--accent));
        }
        .copy-button:active {
          transform: scale(0.95);
        }
      `}</style>
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <IconHome className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/docs">Documentation</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentDoc.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <IconBook className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Documentation
            </h1>
            <p className="text-muted-foreground mt-1">
              Learn how to set up and use Hawk
            </p>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        {/* Sidebar Navigation */}
        <aside className="space-y-4">
          <div className="lg:sticky lg:top-6">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Table of Contents
              </h2>
              <nav className="space-y-1">
                {docsConfig.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/docs?doc=${doc.id}`}
                    className="block"
                  >
                    <Button
                      variant={selectedDoc === doc.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                    >
                      <div className="flex flex-1 flex-col items-start gap-1">
                        <span className="font-medium text-sm">{doc.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </span>
                      </div>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">{currentDoc.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentDoc.description}
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <div className="pt-4">
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-pre:bg-muted prose-pre:border prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:font-mono prose-strong:font-semibold">
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
    </div>
    <LandingFooter />
    </>
  );
}
