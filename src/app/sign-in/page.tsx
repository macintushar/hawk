import AuthLayout from "@/components/auth-layout";
import { SignInForm } from "@/components/forms/sign-in";

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
