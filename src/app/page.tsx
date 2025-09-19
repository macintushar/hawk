import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import Link from "next/link";

export default async function Home() {
  const isSignedIn = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(isSignedIn);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to Hawk
        </h1>
        <div className="flex flex-col items-center gap-2">
          <Link href={isSignedIn ? "/admin" : "/sign-in"} prefetch>
            <p className="text-2xl text-white">
              {isSignedIn ? "View Dashboard" : "Get Started"}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
