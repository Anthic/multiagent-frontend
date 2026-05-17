"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import gsap from "gsap";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRegister } from "../../../hooks/useAuth";
import { ApiError } from "../../../types/api";
import { registerSchema } from "@/src/validation/registerSchema";
import z from "zod";


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
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
  {
    id: "confirmPassword" as const,
    label: "Confirm Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
];

const RegistrationPage = () => {
  const [init, setInit] = useState(false);
  const [lottieData, setLottieData] = useState<unknown>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLParagraphElement>(null);

  const { mutate: register, isPending } = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // ── Particles ──────────────────────────────────────────────────
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  // ── Lottie ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/lottie/registration%20lottie.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Lottie: ${res.status}`);
        return res.json();
      })
      .then((data) => setLottieData(data))
      .catch((err) => console.error("Error loading Lottie data:", err));
  }, []);

  // ── GSAP staggered entrance ────────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────
  const onSubmit = ({ name, email, password }: RegisterFormData) => {
    setServerError(null);
    
    register(
      { name, email, password },
      {
        onError: (error: ApiError) => {
          setServerError(error.message);
        
          if (cardRef.current) {
            gsap.fromTo(
              cardRef.current,
              { x: -8 },
              {
                x: 0,
                duration: 0.4,
                ease: "elastic.out(1, 0.3)",
              }
            );
          }
        },
      }
    );
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] font-sans">
      {/* ── Particles ── */}
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

      {/* ── Card ── */}
      <div
        ref={cardRef}
        className="relative z-10 flex w-11/12 max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl md:flex-row"
      >
        {/* ── Left: Form ── */}
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
            onSubmit={handleSubmit(onSubmit)}
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
            {fields.map(({ id, label, type, placeholder, autoComplete }, i) => (
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
                <input
                  id={id}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  {...formRegister(id)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors[id] && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors[id]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Submit */}
            <button
              ref={btnRef}
              type="submit"
              disabled={isPending}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:via-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isPending ? "Creating Account..." : "Register Now"}
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

        {/* ── Right: Lottie ── */}
        <div className="relative hidden min-h-[520px] w-full items-center justify-center overflow-hidden bg-white/5 md:flex md:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 mix-blend-overlay" />
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            {lottieData ? (
              <Lottie
                animationData={lottieData}
                className="h-full w-full object-fill"
                loop
                rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Loading animation...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;