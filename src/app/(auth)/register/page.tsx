"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import gsap from "gsap";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRegister } from "../../../hooks/useAuth";
import { bootstrapCsrfToken } from "../../../lib/csrf";
import { ApiError } from "../../../types/api";
import { registerSchema } from "@/src/validation/registerSchema";
import z from "zod";
import { queueAppToast, showAppToast } from "../../../components/ui/appToastEvents";


type RegisterFormData = z.infer<typeof registerSchema>;

const fields = [
  {
    id: "name" as const,
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    autoComplete: "name",
  },
  {
    id: "email" as const,
    label: "Email Address",
    type: "email",
    placeholder: "hello@example.com",
    autoComplete: "email",
  },
  {
    id: "password" as const,
    label: "Password",
    type: "password",
    placeholder: "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢",
    autoComplete: "new-password",
  },
  {
    id: "confirmPassword" as const,
    label: "Confirm Password",
    type: "password",
    placeholder: "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢",
    autoComplete: "new-password",
  },
];

const RegistrationPage = () => {
  const [init, setInit] = useState(false);
  const [lottieData, setLottieData] = useState<unknown>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLParagraphElement>(null);

  const { mutate: register, isPending } = useRegister();

  useEffect(() => {
    bootstrapCsrfToken();
  }, []);

  const {
    control,
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue =
    useWatch({
      control,
      name: "password",
    }) ?? "";
  const passwordChecks = [
    {
      label: "At least 8 characters",
      passed: passwordValue.length >= 8,
    },
    {
      label: "One uppercase letter",
      passed: /[A-Z]/.test(passwordValue),
    },
    {
      label: "One number",
      passed: /[0-9]/.test(passwordValue),
    },
    {
      label: "One special character",
      passed: /[^A-Za-z0-9]/.test(passwordValue),
    },
  ];

  // â”€â”€ Particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // â”€â”€ Lottie â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    fetch("/lottie/registration%20lottie.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Lottie: ${res.status}`);
        return res.json();
      })
      .then((data) => setLottieData(data))
      .catch((err) => console.error("Error loading Lottie data:", err));
  }, []);

  // â”€â”€ GSAP staggered entrance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Card slides up
    tl.fromTo(
      cardRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, delay: 0.1 }
    )
      // Heading fades in
      .fromTo(
        headingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.4"
      )
      // Subtext
      .fromTo(
        subRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "-=0.3"
      )
      // Fields stagger
      .fromTo(
        fieldRefs.current.filter(Boolean),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        "-=0.2"
      )
      // Button
      .fromTo(
        btnRef.current,
        { y: 12, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4 },
        "-=0.1"
      )
      // Link
      .fromTo(
        linkRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 },
        "-=0.1"
      );
  }, []);

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!serverError || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { x: -8 },
      {
        x: 0,
        duration: 0.4,
        ease: "elastic.out(1, 0.3)",
      }
    );
  }, [serverError]);

  const onSubmit = ({ name, email, password }: RegisterFormData) => {
    setServerError(null);
    
    register(
      { name, email, password },
      {
        onSuccess: () => {
          queueAppToast({
            type: "success",
            title: "Account created",
            message: "Your research workspace is ready. Sign in to continue.",
          });
        },
        onError: (error: ApiError) => {
          setServerError(error.message);
          showAppToast({
            type: "error",
            title: "Registration failed",
            message:
              error.message ||
              "We could not create your account. Please check the details and try again.",
          });
        },
      }
    );
  };

  const onInvalid = () => {
    showAppToast({
      type: "info",
      title: "Complete the form",
      message: "Fill every field and make sure the password meets all requirements.",
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
      {/* â”€â”€ Particles â”€â”€ */}
      {init && (
        <Particles
          id="register-particles"
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
        {/* â”€â”€ Left: Form â”€â”€ */}
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          <h2
            ref={headingRef}
            className="mb-2 text-3xl font-bold tracking-wide text-white"
          >
            Create an Account
          </h2>
          <p ref={subRef} className="mb-8 text-sm text-gray-400">
            Join us and start your multi-agent research workflow.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
            noValidate
          >
            {/* Server error */}
            {serverError && (
              <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-200">{serverError}</p>
              </div>
            )}

            {/* Fields */}
            {fields.map(({ id, label, type, placeholder, autoComplete }, i) => {
              const isPasswordField = id === "password";
              const isConfirmPasswordField = id === "confirmPassword";
              const isVisible = isPasswordField
                ? showPassword
                : isConfirmPasswordField
                  ? showConfirmPassword
                  : false;
              const inputType =
                isPasswordField || isConfirmPasswordField
                  ? isVisible
                    ? "text"
                    : "password"
                  : type;

              return (
              <div
                key={id}
                ref={(el) => { fieldRefs.current[i] = el; }}
              >
                <label
                  htmlFor={id}
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  {label}
                </label>
                <div className="relative">
                  <input
                    id={id}
                    type={inputType}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    {...formRegister(id)}
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPasswordField || isConfirmPasswordField ? "pr-12" : ""
                    }`}
                  />
                  {(isPasswordField || isConfirmPasswordField) && (
                    <button
                      type="button"
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      onClick={() => {
                        if (isPasswordField) {
                          setShowPassword((current) => !current);
                          return;
                        }

                        setShowConfirmPassword((current) => !current);
                      }}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="relative block h-4 w-6 rounded-full border border-current">
                        <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                        {isVisible && (
                          <span className="absolute left-1/2 top-1/2 h-[1px] w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                        )}
                      </span>
                    </button>
                  )}
                </div>

                {isPasswordField && (
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-2">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          check.passed ? "text-emerald-300" : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            check.passed ? "bg-emerald-300" : "bg-slate-600"
                          }`}
                        />
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {errors[id] && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors[id]?.message}
                  </p>
                )}
              </div>
              );
            })}

            {/* Submit */}
            <button
              ref={btnRef}
              type="submit"
              disabled={isPending}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isPending ? "Creating Account…" : "Register Now"}
            </button>
          </form>

          {/* Login link */}
          <p ref={linkRef} className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Login
            </Link>
          </p>
        </div>

        {/* â”€â”€ Right: Lottie â”€â”€ */}
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

export default RegistrationPage;
