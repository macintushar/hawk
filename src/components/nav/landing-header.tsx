import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBook, IconBrandGithub, IconMenu2 } from "@tabler/icons-react";
import { GITHUB_URL } from "@/constants";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Logo } from "@/components/theme/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function ViewSourceButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
        <IconBrandGithub className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">View Source</span>
        <span className="sm:hidden">Source</span>
      </Link>
    </Button>
  );
}

function NavToAppButton({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <Button size="sm" asChild>
      <Link href={isSignedIn ? "/app/dashboard" : "/sign-in"}>
        {isSignedIn ? "Dashboard" : "Get Started"}
      </Link>
    </Button>
  );
}

function DocsButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/docs">
        <IconBook className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Documentation</span>
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
        
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-3 md:flex">
          <DocsButton />
          <ViewSourceButton />
          <NavToAppButton isSignedIn={isSignedIn} />
          <ThemeSwitcher side="bottom" variant="outline" />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher side="bottom" variant="outline" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <IconMenu2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/docs">
                    <IconBook className="mr-2 h-4 w-4" />
                    Documentation
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    <IconBrandGithub className="mr-2 h-4 w-4" />
                    View Source
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href={isSignedIn ? "/app/dashboard" : "/sign-in"}>
                    {isSignedIn ? "View Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
