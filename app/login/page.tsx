"use client";

import { loginAction } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, MessageSquare, FileText, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/patients");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-12 flex-col justify-between text-white">
        <div>
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Brain className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Doctors Assistant</h1>
              <p className="text-zinc-400 text-sm">AI-Powered Medical Intelligence</p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Patient Insights</h3>
                <p className="text-zinc-400 text-sm">
                  Get intelligent analysis of patient history and medical records instantly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Medical Summaries</h3>
                <p className="text-zinc-400 text-sm">
                  Generate comprehensive patient summaries with a single click
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Chat with Patient History</h3>
                <p className="text-zinc-400 text-sm">
                  Ask questions and get contextual answers from patient records
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Analytics</h3>
                <p className="text-zinc-400 text-sm">
                  Track trends and patterns in patient data with visual insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="border-l-4 border-white/30 pl-4">
          <p className="italic text-zinc-300 mb-2">
            "This tool has transformed how I approach patient care. The AI insights save me hours every day."
          </p>
          <p className="text-sm text-zinc-500">— Dr. Sarah Johnson, General Practice</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="username"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
