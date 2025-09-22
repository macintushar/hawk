import AuthLayout from "@/components/auth-layout";
import { SignInForm } from "@/components/forms/sign-in";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Hawk",
  description:
    "Sign in with your email and password to access your Hawk dashboard",
};

export default function SignIn() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in with your email and password"
    >
      <SignInForm />
    </AuthLayout>
  );
}
