"use client";

import React from "react";
import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function GitHubOAuthButton() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/app/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with GitHub", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGitHubSignIn}
      isLoading={isLoading}
    >
      <IconBrandGithub className="mr-2 h-4 w-4" />
      Continue with GitHub
    </Button>
  );
}
