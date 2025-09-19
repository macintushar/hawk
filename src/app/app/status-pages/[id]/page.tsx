import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/server";
import { EditStatusPageForm } from "./edit-status-page-form";

interface EditStatusPagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStatusPagePage({
  params,
}: EditStatusPagePageProps) {
  const { id: statusPageId } = await params;

  // Fetch status page data on the server
  const statusPageData = await api.statusPage.list({
    includeMonitors: true,
  });

  // Find the specific status page
  const currentStatusPage = statusPageData?.find(
    (page) => page.id === statusPageId,
  );

  // Fetch all available monitors on the server
  const availableMonitors = await api.monitor.list({});

  if (!currentStatusPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/status-pages">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Status Page Not Found
            </h1>
            <p className="text-muted-foreground">
              The status page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/status-pages">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Status Page
          </h1>
          <p className="text-muted-foreground">
            Update your status page settings and monitor selection
          </p>
        </div>
      </div>

      <EditStatusPageForm
        statusPage={currentStatusPage}
        availableMonitors={availableMonitors}
      />
    </div>
  );
}
