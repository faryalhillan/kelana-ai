import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DayCards from "@/components/DayCards";
import { getTrip, type Recommendation } from "@/services/tripService";

type Props = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  let trip;
  let error = "";
  try {
    trip = await getTrip(Number(id));
  } catch (requestError) {
    error = requestError instanceof Error ? requestError.message : "Unable to load this trip.";
  }

  if (!trip) return <main className="detail-shell"><Link className="back-link" href="/trips">← Back to trips</Link><div className="empty-state"><span className="empty-icon">?</span><h1>Trip not found</h1><p>{error}</p><Link className="primary-link" href="/trips">View trip history <span aria-hidden="true">→</span></Link></div></main>;

  let recommendation: Recommendation | null = null;
  if (trip.ai_recommendations) {
    try { recommendation = JSON.parse(trip.ai_recommendations) as Recommendation; } catch { recommendation = null; }
  }

    return <main className="detail-shell">
      <Navbar active="trips" />
      <header className="detail-header"><Link className="back-link" href="/trips">← Back to trips</Link><span className="eyebrow">TRIP #{trip.id} · {trip.season}</span></header>
    <section className="detail-hero"><div><p className="eyebrow">{trip.category} journey</p><h1>{trip.destinations.join(" · ")}</h1><p className="detail-lede">{trip.days} days in {trip.country}, designed for a {trip.travel_style.toLowerCase()}.</p></div><div className="detail-stat"><strong>{trip.budget.toLocaleString()} {trip.currency}</strong><span>total budget</span></div></section>
    <section className="trip-facts"><div><span>Destination</span><strong>{trip.country}</strong></div><div><span>Daily budget</span><strong>{trip.daily_budget.toLocaleString()} {trip.currency}</strong></div><div><span>Transport</span><strong>{trip.recommendation_transport}</strong></div><div><span>Estimate</span><strong className={trip.budget_exceeded ? "over-budget" : ""}>{trip.total_estimated_cost.toLocaleString()} {trip.currency}</strong></div></section>
      {recommendation ? <section className="detail-itinerary"><div className="detail-section-heading"><p className="eyebrow">AI RECOMMENDATION</p><h2>{recommendation.title}</h2></div><DayCards days={recommendation.daily_itinerary} currency={trip.currency} /></section> : <div className="empty-state compact"><span className="empty-icon">✦</span><h2>Your itinerary is waiting.</h2><p>The trip is saved. Generate its AI recommendations from the planner when you are ready.</p><Link className="primary-link" href="/#planner">Open planner <span aria-hidden="true">→</span></Link></div>}
      <Footer />
  </main>;
}