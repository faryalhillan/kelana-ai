"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAuthToken, getProfile } from "@/services/authService";
import { apiRequest } from "@/services/tripService";

type TripResult = {
  id: number;
  category: string;
  season: string;
  daily_budget: number;
  total_estimated_cost: number;
  budget_exceeded: boolean;
  recommendation_transport: string;
};

type DailyPlan = {
  day: number;
  title: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  estimated_cost: number;
};

type Recommendation = {
  title: string;
  daily_itinerary: DailyPlan[];
  travel_tips: string[];
  local_food_recommendations: string[];
  estimated_budget_breakdown: Record<string, number>;
  assumptions: string[];
};

const initialForm = {
  destinations: "Kyoto, Osaka",
  country: "Japan",
  days: "7",
  budget: "2000",
  hotel_cost: "",
  transportation_cost: "",
  food_cost: "",
  miscellaneous_cost: "",
  currency: "USD",
  travel_month: "October",
  travel_style: "Cultural explorer",
};

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<TripResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setWelcomeName("");
      return;
    }

    getProfile().then((profile) => setWelcomeName(profile.name)).catch(() => setWelcomeName("Traveler"));
  }, []);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function submitTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);
    setRecommendation(null);

    const payload = {
      ...form,
      destinations: form.destinations.split(",").map((place) => place.trim()).filter(Boolean),
      days: Number(form.days),
      budget: Number(form.budget),
      hotel_cost: form.hotel_cost ? Number(form.hotel_cost) : null,
      transportation_cost: form.transportation_cost ? Number(form.transportation_cost) : null,
      food_cost: form.food_cost ? Number(form.food_cost) : null,
      miscellaneous_cost: form.miscellaneous_cost ? Number(form.miscellaneous_cost) : null,
    };

    try {
      const data = await apiRequest<TripResult>("/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResult(data);
      const generated = await generateRecommendation(data.id);
      if (generated) {
        setIsSubmitting(false);
        router.push("/trips");
      } else {
        setIsSubmitting(false);
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to reach the trip planner.");
      setIsSubmitting(false);
    }
  }

  async function generateRecommendation(tripId: number) {
    setIsGenerating(true);
    setError("");
    try {
      const data = await apiRequest<{ recommendation: Recommendation }>(`/api/v1/trips/${tripId}/generate`, {
        method: "POST",
      });
      setRecommendation(data.recommendation as Recommendation);
      return true;
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate the itinerary.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  }

  const input = (field: keyof typeof initialForm, label: string, type = "text", placeholder = "", optional = false) => (
    <label className="field">
      <span>{label}{optional ? <small className="optional-label">(optional)</small> : <b className="required-mark" aria-label="required">*</b>}</span>
      <input required={!optional} value={form[field]} type={type} placeholder={placeholder} onChange={(event) => updateField(field, event.target.value)} />
    </label>
  );

  return (
    <main className="planner-shell">
      <Navbar active="planner" />
      {welcomeName ? (
        <div className="welcome-banner" aria-live="polite">
          Welcome back, {welcomeName} 👋
        </div>
      ) : null}
      <section className="hero-banner relative isolate flex min-h-[360px] items-end overflow-hidden rounded-[2rem] p-6 text-white md:min-h-[430px] md:p-10">
        <Image className="absolute inset-0 -z-20 h-full w-full object-cover" src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85" alt="Traditional Kyoto street surrounded by autumn trees" fill priority sizes="(max-width: 760px) 100vw, 1100px" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,35,30,.82),rgba(15,35,30,.18))]" />
        <div className="max-w-2xl">
          <p className="eyebrow text-[#f4a28d]">TRIP DESIGN STUDIO <span>✦</span></p>
          <h1 className="mb-5 max-w-xl text-5xl leading-[.98] tracking-[-.06em] md:text-7xl">Plan somewhere<br /><em>worth remembering.</em></h1>
          <p className="max-w-md text-base leading-7 text-white/80">Tell us what moves you. We&apos;ll turn the details into a trip with a little more soul.</p>
        </div>
      </section>

      <form id="planner" className="trip-form mt-8 md:mt-12" onSubmit={submitTrip}>
        <div className="form-column">
          <div className="section-heading"><span>01</span><div><h2>Where to?</h2><p>Choose one or several places to explore.</p></div></div>
          <div className="destination-grid">
            {input("destinations", "Destinations", "text", "Tokyo, Kyoto, ...")}
            {input("country", "Country", "text", "Japan")}
          </div>
          <div className="section-heading"><span>02</span><div><h2>Shape the journey</h2><p>Set the pace and personality of your adventure.</p></div></div>
          <div className="journey-grid">
            {input("days", "Days", "number")}
            <label className="field"><span>Travel month<b className="required-mark" aria-label="required">*</b></span><select required value={form.travel_month} onChange={(event) => updateField("travel_month", event.target.value)}>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => <option key={month}>{month}</option>)}</select></label>
            <label className="field field-wide"><span>Travel style<b className="required-mark" aria-label="required">*</b></span><select required value={form.travel_style} onChange={(event) => updateField("travel_style", event.target.value)}>{["Cultural explorer", "Slow & local", "Outdoor adventure", "Food & nightlife", "Luxury escape"].map((style) => <option key={style}>{style}</option>)}</select></label>
          </div>
        </div>

        <aside className="budget-panel">
          <div className="section-heading"><span>03</span><div><h2>Set your budget</h2><p>Give us the numbers. We&apos;ll make them work.</p></div></div>
          <div className="budget-total">{input("budget", "Total budget", "number")}<label className="currency-select"><span>Currency<b className="required-mark" aria-label="required">*</b></span><select required value={form.currency} onChange={(event) => updateField("currency", event.target.value)}><option>USD</option><option>IDR</option><option>EUR</option><option>SGD</option></select></label></div>
          <div className="cost-list">
            {input("hotel_cost", "Hotels", "number", "0", true)}
            {input("transportation_cost", "Getting around", "number", "0", true)}
            {input("food_cost", "Food & drinks", "number", "0", true)}
            {input("miscellaneous_cost", "Extras", "number", "0", true)}
          </div>
          <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? (isGenerating ? "Creating your itinerary..." : "Saving your trip...") : "Generate my trip  →"}</button>
          {error && <p className="status error">{error}</p>}
          {result && <div className="result"><p className="eyebrow">TRIP #{result.id} IS READY</p><h3>{result.category} in {result.season}</h3><p>{result.recommendation_transport}. Your estimated total is {result.total_estimated_cost.toLocaleString()} {form.currency}, or {result.daily_budget.toLocaleString()} per day.</p>{result.budget_exceeded && <strong>This plan is above your budget.</strong>}{isGenerating && <div className="loading-card"><span className="spinner" /><div><strong>Generating your itinerary</strong><p>Bedrock is finding the good stuff.</p></div></div>}{error && !isGenerating && <button className="retry-button" type="button" onClick={() => generateRecommendation(result.id)}>Try generating again</button>}</div>}
        </aside>
      </form>
      {recommendation && <section id="itinerary" className="recommendation"><div className="recommendation-header"><div><p className="eyebrow">YOUR KELANAAI ITINERARY</p><h2>{recommendation.title || "A trip made for you."}</h2></div><div style={{ display: "flex", gap: "10px", alignItems: "center" }}><span>{form.days} DAYS · {form.country.toUpperCase()}</span><button type="button" className="copy-itinerary-button" onClick={() => {
        const itineraryText = `${recommendation.title}\n\n${recommendation.daily_itinerary.map(day => `Day ${day.day}: ${day.title}\nMorning: ${day.morning.join(", ")}\nAfternoon: ${day.afternoon.join(", ")}\nEvening: ${day.evening.join(", ")}\nEstimated cost: ${day.estimated_cost} ${form.currency}\n`).join("\n")}\n\nTravel Tips:\n${recommendation.travel_tips.join("\n")}\n\nLocal Food:\n${recommendation.local_food_recommendations.join("\n")}`;
        navigator.clipboard.writeText(itineraryText).then(() => {
          alert("Itinerary copied to clipboard!");
        }).catch(() => {
          alert("Failed to copy itinerary");
        });
      }}>📋 Copy</button><button type="button" className="copy-itinerary-button" onClick={() => {
        const shareData = {
          title: recommendation.title || "My Travel Itinerary",
          text: `Check out my ${form.days}-day trip to ${form.country} planned with KelanaAI!`,
          url: window.location.href
        };
        if (navigator.share) {
          navigator.share(shareData).catch(() => {});
        } else {
          alert("Sharing not supported on this browser");
        }
      }}>🔗 Share</button></div></div><div className="daily-grid">{recommendation.daily_itinerary.map((day) => <article className="daily-card" key={day.day}><div className="daily-card-top"><span>DAY {day.day}</span><strong>{day.estimated_cost.toLocaleString()} {form.currency}</strong></div><h3>{day.title}</h3>{[["Morning", day.morning], ["Afternoon", day.afternoon], ["Evening", day.evening]].map(([period, activities]) => <div className="activity-block" key={period as string}><h4>{period as string}</h4>{(activities as string[]).map((activity) => <p key={activity}>{activity}</p>)}</div>)}</article>)}</div><div className="recommendation-grid detail-grid"><article className="recommendation-card"><h3>Travel tips</h3>{recommendation.travel_tips.map((tip) => <p key={tip}>{tip}</p>)}</article><article className="recommendation-card"><h3>Local food</h3>{recommendation.local_food_recommendations.map((food) => <p key={food}>{food}</p>)}</article><article className="recommendation-card"><h3>Budget breakdown</h3>{Object.entries(recommendation.estimated_budget_breakdown).map(([label, amount]) => <p className="budget-line" key={label}><span>{label.replaceAll("_", " ")}</span><strong>{amount.toLocaleString()} {form.currency}</strong></p>)}</article><article className="recommendation-card"><h3>Assumptions</h3>{recommendation.assumptions.map((assumption) => <p key={assumption}>{assumption}</p>)}</article></div></section>}
      <Footer />
    </main>
  );
}

