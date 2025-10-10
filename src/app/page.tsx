import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  IconAlertCircle,
  IconAppWindow,
  IconBook,
  IconBrandGithub,
  IconBrandSlack,
  IconDashboard,
  IconHeartRateMonitor,
  IconServer,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import { GITHUB_URL } from "@/constants";
import { LandingHeader } from "@/components/nav/landing-header";
import { LandingFooter } from "@/components/nav/landing-footer";

const features = [
  {
    title: "HTTP Monitors",
    description:
      "Create custom monitors with CRON schedules and failure thresholds",
    icon: IconHeartRateMonitor,
  },
  {
    title: "Incident Management",
    description:
      "Automatic incident creation and resolution based on consecutive failures",
    icon: IconAlertCircle,
  },
  {
    title: "Slack Notifications",
    description:
      "Get instant alerts via Slack webhooks when services go down or recover",
    icon: IconBrandSlack,
  },
  {
    title: "Public Status Pages",
    description:
      "Share live uptime charts and incident history with your users",
    icon: IconAppWindow,
  },
  {
    title: "Secure Authentication",
    description:
      "Built-in sign-in/sign-up flows with secure session management",
    icon: IconShield,
  },
  {
    title: "Real-time Dashboard",
    description:
      "Overview cards, recent activity, and quick actions for fast navigation",
    icon: IconDashboard,
  },
];

function ViewSourceButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
        <IconBrandGithub className="mr-2 h-4 w-4" />
        View Source
      </Link>
    </Button>
  );
}

function NavToAppButton({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <Button size="sm" asChild>
      <Link href={isSignedIn ? "/app/dashboard" : "/sign-in"}>
        {isSignedIn ? "View Dashboard" : "Get Started"}
      </Link>
    </Button>
  );
}

function DocsButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/docs">
        <IconBook className="mr-2 h-4 w-4" />
        Documentation
      </Link>
    </Button>
  );
}

export default async function HawkLandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isSignedIn = session && session.session !== null;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <LandingHeader isSignedIn={isSignedIn} />

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            Open Source • Self-Hosted • Developer-First
          </Badge>
          <h1 className="text-foreground mb-6 text-5xl font-bold text-balance md:text-6xl">
            Monitoring for your stack,{" "}
            <span className="text-muted-foreground">within your stack</span>
          </h1>
          <p className="text-muted-foreground mb-8 text-xl leading-relaxed text-balance">
            Track uptime and performance for your services, get alerted on
            incidents, and publish beautiful public status pages—all in one
            self-hosted platform.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <NavToAppButton isSignedIn={isSignedIn} />
            <DocsButton />
            <ViewSourceButton />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
              Everything you need to monitor your services
            </h2>
            <p className="text-muted-foreground text-lg text-balance">
              Built by developers, for developers. No complex setup, no vendor
              lock-in.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                className="border-border transition-shadow hover:shadow-lg"
                key={feature.title}
              >
                <CardHeader>
                  <div className="bg-secondary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="demo" className="px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mb-6 text-3xl font-bold md:text-4xl">
            Ready to monitor your stack?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg text-balance">
            Get started in minutes with our one-click deployment or clone the
            repository to self-host.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <NavToAppButton isSignedIn={isSignedIn} />
            <DocsButton />
            <ViewSourceButton />
          </div>

          <div className="text-muted-foreground flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              <span>MIT Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <IconBrandGithub className="h-4 w-4" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <IconServer className="h-4 w-4" />
              <span>Self-Hosted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
