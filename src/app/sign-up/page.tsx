import AuthLayout from "@/components/auth-layout";
import { SignUpForm } from "@/components/forms/sign-up";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Hawk",
  description:
    "Sign up with your email and password to use Hawk to monitor your services",
};

export default function SignUp() {
  return (
    <AuthLayout
      title="Welcome"
      description="Sign up with your email and password"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
