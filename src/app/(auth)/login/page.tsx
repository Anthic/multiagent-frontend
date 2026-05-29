"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import gsap from "gsap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLogin } from "../../../hooks/useAuth";
import { bootstrapCsrfToken } from "../../../lib/csrf";
import { ApiError } from "../../../types/api";
import { loginSchema } from "@/src/validation/loginSchema";
import { queueAppToast, showAppToast } from "../../../components/ui/appToastEvents";



type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [init, setInit] = useState(false);
  const [lottieData, setLottieData] = useState<unknown>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    bootstrapCsrfToken();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // â”€â”€ Particles init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // â”€â”€ Lottie load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    fetch("/lottie/Sign%20up.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Lottie: ${res.status}`);
        return res.json();
      })
      .then((data) => setLottieData(data))
      .catch((err) => console.error("Error loading Lottie data:", err));
  }, []);

  // â”€â”€ GSAP card entrance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  // â”€â”€ Form submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    login(data, {
      onSuccess: () => {
        queueAppToast({
          type: "success",
          title: "Signed in",
          message: "Welcome back. Your research dashboard is ready.",
        });
      },
      onError: (error: ApiError) => {
        setServerError(error.message);
        showAppToast({
          type: "error",
          title: "Login failed",
          message:
            error.message ||
            "We could not sign you in. Please check your email and password.",
        });
      },
    });
  };

  const onInvalid = () => {
    showAppToast({
      type: "info",
      title: "Check your details",
      message: "Enter a valid email and password before signing in.",
    });
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] font-sans">
      {/* â”€â”€ Floating Back Button â”€â”€ */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gray-300 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Home
      </Link>
      {/* â”€â”€ Particles background â”€â”€ */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
              color: { value: "#ffffff" },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "bounce" },
              },
              number: {
                density: { enable: true, height: 800, width: 800 },
                value: 60,
              },
              opacity: { value: 0.3 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
        />
      )}

      {/* â”€â”€ Card â”€â”€ */}
      <div
        ref={cardRef}
        className="relative z-10 flex w-11/12 max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl md:flex-row"
      >
        {/* â”€â”€ Left: Form panel â”€â”€ */}
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          <h2 className="mb-2 text-3xl font-bold tracking-wide text-white">
            Welcome Back
          </h2>
          <p className="mb-8 text-sm text-gray-400">
            Sign in to continue your premium experience.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-5"
            noValidate
          >
            {/* Server error banner */}
            {serverError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="hello@example.com"
                {...register("email")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isPending ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don&rsquo;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Register
            </Link>
          </p>
        </div>

        {/* â”€â”€ Right: Lottie panel â”€â”€ */}
        <div className="relative hidden min-h-[520px] w-full items-center justify-center overflow-hidden bg-white/5 md:flex md:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 mix-blend-overlay" />
          <div className="relative z-10 flex h-full w-full items-center justify-center px-8 py-10">
            {lottieData ? (
              <Lottie
                animationData={lottieData}
                className="h-full max-h-[430px] w-full max-w-[420px] object-contain"
                loop
                rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Loading animation…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
