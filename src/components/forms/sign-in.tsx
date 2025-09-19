"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import type z from "zod";

import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Separator } from "../ui/separator";
import { HiddenInput } from "../ui/hidden-input";

import { signInSchema } from "@/schemas";

export function SignInForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof signInSchema>) {
    console.log(values);
    try {
      const res = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (res.error) {
        toast.error(res.error.message);
      }

      if (res.data?.user.id) {
        toast.success("Signed in successfully");
        router.push("/admin");
      }
    } catch (error) {
      toast.error("An error occurred", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  }
  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <Separator />
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="mac@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      {/* <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a> */}
                    </div>
                    <FormControl>
                      <HiddenInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </CardContent>
  );
}
