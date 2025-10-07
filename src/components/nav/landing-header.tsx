import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBook, IconBrandGithub } from "@tabler/icons-react";
import { GITHUB_URL } from "@/constants";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Logo } from "@/components/theme/logo";

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

export function LandingHeader({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <header className="border-border bg-card/50 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Logo
              width={120}
              height={40}
              className="fill-foreground"
              textColor="text-foreground"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <DocsButton />
          <ViewSourceButton />
          <NavToAppButton isSignedIn={isSignedIn} />
          <ThemeSwitcher side="bottom" variant="outline" />
        </div>
      </div>
    </header>
  );
}
