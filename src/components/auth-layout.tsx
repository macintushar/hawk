import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Logo } from "./theme/logo";

export default function AuthLayout({
  title,
  description,
  children,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo
            width={120}
            height={40}
            textColor="text-foreground"
            className="fill-foreground"
          />
        </Link>
        <div className={"flex flex-col gap-6"}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            {children}
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
