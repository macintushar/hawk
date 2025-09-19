"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";

export default function StatusPagesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: statusPages = [], isLoading } = api.statusPage.list.useQuery({
    includeMonitors: true,
  });

  const filteredStatusPages = statusPages.filter(
    (page) =>
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status Pages</h1>
          <p className="text-muted-foreground">
            Create and manage public status pages
          </p>
        </div>
        <Button asChild>
          <Link href="/app/status-pages/new">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Status Page
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Status Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search status pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Pages Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <h1>Loading...</h1>
        ) : filteredStatusPages.length > 0 ? (
          filteredStatusPages.map((page) => (
            <Card key={page.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    {page.description && (
                      <p className="text-muted-foreground text-sm">
                        {page.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {(page as unknown as { monitorCount: number }).monitorCount}{" "}
                    monitor
                    {(page as unknown as { monitorCount: number })
                      .monitorCount !== 1
                      ? "s"
                      : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground text-sm">
                  Created {formatDate(page.createdAt)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/status/${page.slug}`} target="_blank">
                        <IconEye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/status-pages/${page.id}`}>
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No status pages match your search"
                : "No status pages yet"}
            </p>
            <Button asChild>
              <Link href="/app/status-pages/new">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Your First Status Page
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
