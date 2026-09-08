"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAuthToken } from "@/services/authService";
import { 
  MapIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckIcon,
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2400&q=85"
            alt="Beautiful travel destination"
            fill
            className="object-cover opacity-[0.15]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--paper)] via-[var(--paper)]/95 to-[var(--paper)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-24 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[var(--mint)] border border-[var(--line)] rounded-full">
              <SparklesIcon className="w-4 h-4 text-[var(--coral)]" />
              <span className="text-sm font-semibold text-[var(--ink)]">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--ink)] mb-6 leading-tight">
              Plan trips worth <br />
              <span className="text-[var(--coral)] italic font-serif">remembering</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Tell us what moves you. We&apos;ll turn your ideas into a personalized itinerary with AI that understands, creates, and refines your perfect journey.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href={isAuthenticated ? "/planner" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coral)] text-white font-semibold rounded-xl hover:bg-[#d86447] transition-all hover:shadow-lg hover:-translate-y-0.5 text-lg"
              >
                Start Planning Free
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--ink)] font-semibold rounded-xl border-2 border-[var(--line)] hover:border-[var(--coral)] transition-all text-lg"
              >
                See How It Works
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>Free to use</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[var(--coral)] uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4 font-serif">
              Your perfect trip in 4 simple steps
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
              From inspiration to itinerary in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us Your Vision",
                description: "Share your destinations, travel style, budget, and preferences. The more you tell us, the better we create.",
                icon: ChatBubbleLeftRightIcon
              },
              {
                step: "02",
                title: "AI Generates Your Plan",
                description: "Our AI analyzes thousands of travel insights to craft a personalized day-by-day itinerary just for you.",
                icon: SparklesIcon
              },
              {
                step: "03",
                title: "Refine with AI Chat",
                description: "Chat with AI to adjust activities, timing, or budget. Get instant recommendations and local tips.",
                icon: ChatBubbleLeftRightIcon
              },
              {
                step: "04",
                title: "Save & Access Anywhere",
                description: "Your trip is saved to your account. Access it anytime, share with travel companions, or export it.",
                icon: MapIcon
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-[var(--mint)] rounded-2xl p-8 h-full border border-[var(--line)] hover:border-[var(--coral)] transition-all hover:shadow-lg">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--coral)] text-white rounded-xl mb-6">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-[var(--coral)] mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-[var(--ink)] mb-3">{item.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRightIcon className="w-8 h-8 text-[var(--coral)] opacity-30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-[var(--coral)] uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4 font-serif">
              Everything you need to plan
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
              Powerful AI tools to create, refine, and perfect your travel experience
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Trip Planner",
                description: "Create comprehensive itineraries with daily schedules, activities, and budget breakdowns. Our AI considers your preferences, travel style, and constraints.",
                icon: MapIcon,
                features: ["Day-by-day itineraries", "Budget optimization", "Local recommendations", "Travel tips"],
                link: "/planner"
              },
              {
                title: "Ask AI",
                description: "Get instant answers to your travel questions. From visa requirements to best local restaurants, our AI knowledge base has you covered.",
                icon: SparklesIcon,
                features: ["Travel Q&A", "Destination insights", "Cultural tips", "Safety advice"],
                link: "/assistant"
              },
              {
                title: "AI Chat",
                description: "Have a conversation about your trip. Refine your itinerary, explore alternatives, and get personalized suggestions in real-time.",
                icon: ChatBubbleLeftRightIcon,
                features: ["Real-time refinement", "Alternative suggestions", "Budget adjustments", "Activity swaps"],
                link: "/chat"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-[var(--line)] hover:border-[var(--coral)] transition-all hover:shadow-xl group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--coral)] to-[#d86447] text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--ink)] mb-4">{feature.title}</h3>
                <p className="text-[var(--muted)] mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3 mb-6">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--ink)]">
                      <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href={feature.link}
                  className="inline-flex items-center gap-2 text-[var(--coral)] font-semibold hover:gap-3 transition-all"
                >
                  Try it now
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 bg-white border-y border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { icon: GlobeAltIcon, value: "150+", label: "Countries Covered" },
              { icon: CalendarIcon, value: "10K+", label: "Trips Planned" },
              { icon: CurrencyDollarIcon, value: "Free", label: "Always Free to Use" }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--mint)] rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-[var(--coral)]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-2">{stat.value}</div>
                <div className="text-[var(--muted)] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-[var(--mint)] to-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-6 font-serif">
            Ready to plan your next adventure?
          </h2>
          <p className="text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who trust KelanaAI to create unforgettable journeys. Start planning for free today.
          </p>
          <Link 
            href={isAuthenticated ? "/planner" : "/register"}
            className="inline-flex items-center gap-2 px-10 py-5 bg-[var(--coral)] text-white font-bold rounded-xl hover:bg-[#d86447] transition-all hover:shadow-xl hover:-translate-y-1 text-lg"
          >
            Start Planning Your Trip
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-[var(--muted)]">
            No credit card required • Free forever • Start in seconds
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
