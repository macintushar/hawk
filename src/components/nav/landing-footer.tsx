import Link from "next/link";
import { IconBrandGithub } from "@tabler/icons-react";
import { GITHUB_URL } from "@/constants";
import { Logo } from "@/components/theme/logo";

export function LandingFooter() {
  return (
    <footer className="border-border border-t px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Logo
                width={120}
                height={40}
                className="fill-foreground"
                textColor="text-foreground"
              />
            </Link>
            <p className="text-muted-foreground">•</p>
            <span className="text-muted-foreground">
              Monitoring for your stack
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Documentation
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconBrandGithub className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          <p>MIT © Tushar Selvakumar</p>
        </div>
      </div>
    </footer>
  );
}
