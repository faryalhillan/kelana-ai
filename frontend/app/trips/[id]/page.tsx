"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DayCards from "@/components/DayCards";
import TripRefinement from "@/components/TripRefinement";
import { apiRequest, deleteTrip, generateTrip, type Recommendation, type Trip, type TripUpdate, updateTrip } from "@/services/tripService";
import { getTripConversation } from "@/services/refinementService";

type Props = { params: Promise<{ id: string }> };

export default function TripDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<TripUpdate | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError("");
    apiRequest<Trip>(`/api/v1/trips/${Number(id)}`)
      .then((data) => {
        setTrip(data);
        setIsLoading(false);
        
        // Load or create conversation for this trip
        getTripConversation(Number(id))
          .then((conversation) => {
            setConversationId(conversation.conversation_id);
          })
          .catch((err) => {
            console.error("Failed to load trip conversation:", err);
          });
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load this trip.");
        setIsLoading(false);
      });
  }, [id]);

  const beginEditing = () => {
    if (!trip) return;
    setForm({
      destinations: trip.destinations,
      country: trip.country,
      budget: trip.budget,
      days: trip.days,
      hotel_cost: trip.hotel_cost,
      transportation_cost: trip.transportation_cost,
      food_cost: trip.food_cost,
      miscellaneous_cost: trip.miscellaneous_cost,
      currency: trip.currency,
      travel_month: trip.travel_month,
      travel_style: trip.travel_style,
    });
    setFormError("");
    setIsEditing(true);
  };

  const updateField = <K extends keyof TripUpdate>(field: K, value: TripUpdate[K]) => {
    setForm((current) => current ? { ...current, [field]: value } : current);
  };

  const saveTrip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setIsSaving(true);
    setFormError("");
    try {
      const updatedTrip = await updateTrip(Number(id), form);
      setTrip(updatedTrip);
      setIsEditing(false);
      
      // Auto-regenerate itinerary with new trip details
      await regenerateItinerary(updatedTrip);
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "Unable to update this trip.");
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateItinerary = async (tripData?: Trip) => {
    const targetTrip = tripData || trip;
    if (!targetTrip) return;
    
    setIsSaving(true);
    setFormError("");
    try {
      const response = await generateTrip(targetTrip.id);
      // Update the trip with the new AI recommendations
      setTrip({
        ...targetTrip,
        ai_recommendations: JSON.stringify(response.recommendation),
      });
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "Unable to regenerate itinerary.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeTrip = async () => {
    if (!window.confirm("Delete this saved trip? This cannot be undone.")) return;
    setIsDeleting(true);
    setFormError("");
    try {
      await deleteTrip(Number(id));
      router.push("/trips");
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "Unable to delete this trip.");
      setIsDeleting(false);
    }
  };

  const handleChangesApplied = async () => {
    // Refresh trip data after changes are applied
    try {
      const data = await apiRequest<Trip>(`/api/v1/trips/${Number(id)}`);
      setTrip(data);
    } catch (err) {
      console.error("Failed to refresh trip:", err);
    }
  };

  if (isLoading) {
    return (
      <main className="detail-shell">
        <Navbar active="trips" />
        <header className="detail-header">
          <Link className="back-link" href="/trips">← Back to trips</Link>
          <span className="eyebrow">LOADING TRIP...</span>
        </header>
        <div className="trip-detail-skeleton">
          <div className="skeleton-hero">
            <div className="skeleton-text skeleton-eyebrow"></div>
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-subtitle"></div>
          </div>
          <div className="skeleton-stats">
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-text skeleton-full"></div>
            <div className="skeleton-text skeleton-full"></div>
            <div className="skeleton-text skeleton-medium"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-shell">
        <Navbar active="trips" />
        <div className="empty-state error-state">
          <span className="empty-icon">!</span>
          <h1>Unable to load trip</h1>
          <p>{error}</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button 
              className="primary-link" 
              onClick={() => {
                setError("");
                setIsLoading(true);
                apiRequest<Trip>(`/api/v1/trips/${Number(id)}`)
                  .then((data) => {
                    setTrip(data);
                    setIsLoading(false);
                  })
                  .catch((requestError) => {
                    setError(requestError instanceof Error ? requestError.message : "Unable to load this trip.");
                    setIsLoading(false);
                  });
              }}
            >
              Try again
            </button>
            <Link className="secondary-link" href="/trips">Back to trips</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!trip) return null;

  let recommendation: Recommendation | null = null;
  if (trip.ai_recommendations) {
    try { recommendation = JSON.parse(trip.ai_recommendations) as Recommendation; } catch { recommendation = null; }
  }

    return <main className="detail-shell">
      <Navbar active="trips" />
      <header className="detail-header"><Link className="back-link" href="/trips">← Back to trips</Link><span className="eyebrow">TRIP #{trip.id} · {trip.season}</span></header>
      <div className="detail-actions">
        <button type="button" className="secondary-link" onClick={beginEditing}>Edit trip</button>
        {recommendation && (
          <button 
            type="button" 
            className="regenerate-button" 
            onClick={() => regenerateItinerary()}
            disabled={isSaving}
          >
            {isSaving ? "Regenerating..." : "Regenerate itinerary"}
          </button>
        )}
        <button type="button" className="danger-button" onClick={removeTrip} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete trip"}</button>
      </div>
      {formError ? <p className="status error">{formError}</p> : null}
      {isSaving && !isEditing && (
        <div className="regeneration-notice">
          <span className="spinner" />
          <div>
            <strong>Regenerating your itinerary</strong>
            <p>KelanaAI is creating a fresh plan based on your updated details...</p>
          </div>
        </div>
      )}
      {isEditing && form ? <form className="trip-edit-form" onSubmit={saveTrip}>
        <div className="detail-section-heading"><p className="eyebrow">EDIT SAVED TRIP</p><h2>Refine the journey</h2></div>
        <div className="edit-grid">
          <label className="field field-wide"><span>Destinations</span><input value={form.destinations.join(", ")} onChange={(event) => updateField("destinations", event.target.value.split(",").map((destination) => destination.trim()).filter(Boolean))} required /></label>
          <label className="field"><span>Country</span><input value={form.country} onChange={(event) => updateField("country", event.target.value)} required /></label>
          <label className="field field-wide"><span>Travel style</span><select value={form.travel_style} onChange={(event) => updateField("travel_style", event.target.value)} required>{["Cultural explorer", "Slow & local", "Outdoor adventure", "Food & nightlife", "Luxury escape"].map((style) => <option key={style} value={style}>{style}</option>)}</select></label>
          <label className="field"><span>Budget</span><input type="number" min="0" value={form.budget} onChange={(event) => updateField("budget", Number(event.target.value))} required /></label>
          <label className="field"><span>Days</span><input type="number" min="1" value={form.days} onChange={(event) => updateField("days", Number(event.target.value))} required /></label>
          <label className="field"><span>Travel month</span><input value={form.travel_month} onChange={(event) => updateField("travel_month", event.target.value)} required /></label>
          <label className="field"><span>Currency</span><input value={form.currency} onChange={(event) => updateField("currency", event.target.value)} required /></label>
          <label className="field"><span>Hotel cost</span><input type="number" min="0" value={form.hotel_cost ?? ""} onChange={(event) => updateField("hotel_cost", event.target.value === "" ? null : Number(event.target.value))} /></label>
          <label className="field"><span>Transport cost</span><input type="number" min="0" value={form.transportation_cost ?? ""} onChange={(event) => updateField("transportation_cost", event.target.value === "" ? null : Number(event.target.value))} /></label>
          <label className="field"><span>Food cost</span><input type="number" min="0" value={form.food_cost ?? ""} onChange={(event) => updateField("food_cost", event.target.value === "" ? null : Number(event.target.value))} /></label>
          <label className="field"><span>Miscellaneous cost</span><input type="number" min="0" value={form.miscellaneous_cost ?? ""} onChange={(event) => updateField("miscellaneous_cost", event.target.value === "" ? null : Number(event.target.value))} /></label>
        </div>
        <div className="edit-actions"><button type="submit" className="submit-button" disabled={isSaving}>{isSaving ? (isEditing ? "Saving & regenerating..." : "Regenerating itinerary...") : "Save changes"}</button><button type="button" className="secondary-link" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button></div>
      </form> : null}
    <section className="detail-hero"><div><p className="eyebrow">{trip.category} journey</p><h1>{trip.destinations.join(" · ")}</h1><p className="detail-lede">{trip.days} days in {trip.country}, designed for a {trip.travel_style.toLowerCase()}.</p></div><div className="detail-stat"><strong>{trip.budget.toLocaleString()} {trip.currency}</strong><span>total budget</span></div></section>
    <section className="trip-facts"><div><span>Destination</span><strong>{trip.country}</strong></div><div><span>Daily budget</span><strong>{trip.daily_budget.toLocaleString()} {trip.currency}</strong></div><div><span>Transport</span><strong>{trip.recommendation_transport}</strong></div><div><span>Estimate</span><strong className={trip.budget_exceeded ? "over-budget" : ""}>{trip.total_estimated_cost.toLocaleString()} {trip.currency}</strong></div></section>
      {recommendation ? <section className="detail-itinerary"><div className="detail-section-heading"><p className="eyebrow">AI RECOMMENDATION</p><h2>{recommendation.title}</h2></div><DayCards days={recommendation.daily_itinerary} currency={trip.currency} /></section> : <div className="empty-state compact"><span className="empty-icon">✦</span><h2>Your itinerary is waiting.</h2><p>The trip is saved. Generate its AI recommendations from the planner when you are ready.</p><Link className="primary-link" href="/#planner">Open planner <span aria-hidden="true">→</span></Link></div>}
      
      {recommendation && conversationId && (
        <section className="detail-refinement">
          <TripRefinement 
            tripId={Number(id)} 
            conversationId={conversationId}
            onChangesApplied={handleChangesApplied}
          />
        </section>
      )}
      
      <Footer />
  </main>;
}