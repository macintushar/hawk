import AuthLayout from "@/components/auth-layout";
import { SignUpForm } from "@/components/forms/sign-up";

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
