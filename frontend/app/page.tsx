"use client";
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { getAuthToken } from "@/services/authService";
import { 
  MapPin, 
  Sparkles, 
  MessageCircle,
  ArrowRight,
  Check,
  Globe,
  Calendar,
  DollarSign,
  Zap,
  Shield,
  Stars
} from "lucide-react";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Navbar />
      </div>
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">

        {/* Subtle radial ambient glow behind text */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "600px",
            background: "radial-gradient(ellipse at center, rgba(231,111,81,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12 md:pb-16 text-center">

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 border border-[var(--line)] rounded-full" style={{ background: "var(--surface)" }}>
            <span className="w-2 h-2 rounded-full bg-[var(--coral)] animate-pulse" />
            <span className="text-sm font-semibold text-[var(--ink)]">AI-Powered Travel Planning</span>
          </div>

          {/* Main headline — editorial split layout */}
          <div className="mb-8">
            <h1 className="landing-hero-title">
              <span className="landing-hero-line1">Your next trip,</span>
              <span className="landing-hero-line2">
                <em className="landing-hero-accent">designed</em> by AI
              </span>
              <span className="landing-hero-line3">built for you.</span>
            </h1>
          </div>

          {/* Sub-headline */}
          <p className="landing-hero-sub">
            Tell us where you want to go. KelanaAI builds a complete,
            day‑by‑day itinerary — personalised to your budget, style,
            and curiosity.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={isAuthenticated ? "/planner" : "/register"}
              className="landing-cta-primary"
            >
              Start Planning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="landing-cta-secondary"
            >
              See how it works
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)] mb-16">
            {[
              { icon: Check, text: "No credit card" },
              { icon: Shield, text: "Free forever" },
              { icon: Zap, text: "Ready in seconds" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[var(--coral)]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel — full-bleed inside container */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
          <HeroCarousel />
        </div>
      </section>

      {/* ── SOCIAL PROOF RIBBON ── */}
      <section className="py-14 border-y border-[var(--line)]" style={{ background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Globe, value: "150+", label: "Countries Covered" },
              { icon: Calendar, value: "10K+", label: "Trips Planned" },
              { icon: Stars, value: "Free", label: "Always Free" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--mint)]">
                  <Icon className="w-6 h-6 text-[var(--coral)]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">{value}</div>
                <div className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24" style={{ background: "var(--paper)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[var(--coral)] uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4 font-serif">
              Your perfect trip in 4 simple steps
            </h2>
            <p className="section-subtitle text-lg text-[var(--muted)]">
              From inspiration to itinerary in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Tell Us Your Vision", description: "Share destinations, travel style, budget, and preferences. The more detail, the better the plan.", icon: MessageCircle },
              { step: "02", title: "AI Builds Your Plan", description: "KelanaAI analyses your input and crafts a personalised day-by-day itinerary in seconds.", icon: Sparkles },
              { step: "03", title: "Refine with AI Chat", description: "Chat to adjust activities, swap ideas, or change your budget — all in natural language.", icon: MessageCircle },
              { step: "04", title: "Save & Access Anywhere", description: "Your trip is stored in your account. Revisit, update, or share it whenever you like.", icon: MapPin },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="how-it-works-card">
                  <div className="how-it-works-number">{item.step}</div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--coral)] text-white rounded-xl mb-5">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-10 -right-3 z-10">
                    <ArrowRight className="w-6 h-6 text-[var(--coral)] opacity-25" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24" style={{ background: "linear-gradient(to bottom, var(--surface), var(--paper))" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[var(--coral)] uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4 font-serif">
              Everything you need to plan
            </h2>
            <p className="section-subtitle text-lg text-[var(--muted)]">
              Powerful AI tools to create, refine, and perfect your travel experience
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Trip Planner",
                description: "Create comprehensive itineraries with daily schedules, activities, and budget breakdowns tailored to your preferences.",
                icon: MapPin,
                features: ["Day-by-day itineraries", "Budget optimisation", "Local recommendations", "Travel tips"],
                link: "/planner",
                tag: "Core"
              },
              {
                title: "Ask AI",
                description: "Get instant answers grounded in your travel documents — from visa requirements to the best local eats.",
                icon: Sparkles,
                features: ["Travel Q&A", "Destination insights", "Cultural tips", "Safety advice"],
                link: "/assistant",
                tag: "Knowledge"
              },
              {
                title: "AI Chat",
                description: "Have a live conversation about your trip. Refine the itinerary, explore alternatives, and get real-time suggestions.",
                icon: MessageCircle,
                features: ["Real-time refinement", "Alternative suggestions", "Budget adjustments", "Activity swaps"],
                link: "/chat",
                tag: "Copilot"
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card rounded-2xl p-8 border border-[var(--line)] hover:border-[var(--coral)] transition-all hover:shadow-xl group relative overflow-hidden" style={{ background: "var(--surface)" }}>
                {/* Subtle top accent stripe */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--coral)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider bg-[var(--mint)] text-[var(--sage-dark)] mb-6">
                  {feature.tag}
                </div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[var(--coral)] to-[#d86447] text-white rounded-2xl mb-5 group-hover:scale-105 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">{feature.title}</h3>
                <p className="text-[var(--muted)] mb-6 leading-relaxed text-sm">{feature.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
                      <div className="w-4 h-4 rounded-full bg-[var(--mint)] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-[var(--sage-dark)]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={feature.link} className="inline-flex items-center gap-2 text-sm text-[var(--coral)] font-bold hover:gap-3 transition-all">
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 relative overflow-hidden landing-cta-section">
        {/* Ambient blobs */}
        <div aria-hidden="true" style={{ position: "absolute", top: "-20%", right: "-5%", width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(231,111,81,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-20%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(136,167,152,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5">
            <Sparkles className="w-4 h-4 text-[var(--coral)]" />
            <span className="text-sm font-semibold text-white/70">Ready when you are</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight">
            Your next adventure<br />
            <span className="text-[var(--coral)] italic">starts here.</span>
          </h2>
          <p className="text-lg text-white/60 mb-10 leading-relaxed">
            Join thousands of travellers who trust KelanaAI to plan smarter,
            travel better, and make every trip unforgettable.
          </p>
          <Link
            href={isAuthenticated ? "/planner" : "/register"}
            className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--coral)] text-white font-bold rounded-xl hover:bg-[#d86447] transition-all hover:shadow-2xl hover:-translate-y-1 text-lg"
          >
            Start Planning — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/40">
            No credit card required · Free forever · Start in seconds
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Footer />
      </div>
    </div>
  );
}