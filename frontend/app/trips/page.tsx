import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TripList from "@/components/TripList";
import { getTrips, type Trip } from "@/services/tripService";

export default async function TripsPage() {
	let trips: Trip[] = [];
	let error = "";
	try {
		trips = await getTrips();
	} catch (requestError) {
		error = requestError instanceof Error ? requestError.message : "Unable to load your trips.";
	}

	return (
		<main className="history-shell">
			<Navbar active="trips" />
			<section className="history-intro">
				<p className="eyebrow">YOUR TRAVEL ARCHIVE</p>
				<h1>Trip history</h1>
				<p>Every itinerary you have shaped, gathered in one place.</p>
			</section>
			{error ? <div className="empty-state error-state"><span className="empty-icon">!</span><h2>We could not reach your trips.</h2><p>{error}</p><Link className="primary-link" href="/trips">Try again <span aria-hidden="true">→</span></Link></div> : trips.length === 0 ? <div className="empty-state"><span className="empty-icon">✈</span><h2>No trips found.</h2><p>Create your first itinerary and give the next journey somewhere to begin.</p><Link className="primary-link" href="/#planner">Generate a trip <span aria-hidden="true">→</span></Link></div> : <TripList trips={trips} />}
			<Footer />
		</main>
	);
}
