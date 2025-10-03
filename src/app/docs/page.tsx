"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBook, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const currentDoc = docsConfig.find((d) => d.id === selectedDoc) ?? docsConfig[0];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <IconBook className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Documentation</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contents
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
                  className="w-full justify-start"
                >
                  <div className="flex flex-1 flex-col items-start">
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {doc.description}
                    </span>
                  </div>
                  {selectedDoc === doc.id && (
                    <IconChevronRight className="ml-auto h-4 w-4" />
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
