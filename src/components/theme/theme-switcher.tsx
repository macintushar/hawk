"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button, type buttonVariants } from "../ui/button";
import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import type { VariantProps } from "class-variance-authority";

type ThemeSwitcherProps = {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function ThemeSwitcher({
  variant = "ghost",
  size = "icon",
}: ThemeSwitcherProps) {
  const theme = useTheme();
  const ThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <IconSun className="size-4" />;
      case "dark":
        return <IconMoon className="size-4" />;
      case "system":
        return <IconDeviceLaptop className="size-4" />;
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {ThemeIcon(theme.theme ?? "system")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem onClick={() => theme.setTheme("light")}>
          {ThemeIcon("light")} Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => theme.setTheme("dark")}>
          {ThemeIcon("dark")} Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => theme.setTheme("system")}>
          {ThemeIcon("system")} System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
