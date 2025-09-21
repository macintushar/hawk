import AuthLayout from "@/components/auth-layout";
import { SignInForm } from "@/components/forms/sign-in";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Hawk",
  description:
    "Sign up with your email and password to use Hawk to monitor your services",
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
