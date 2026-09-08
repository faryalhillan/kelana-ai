"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TripList from "@/components/TripList";
import { apiRequest, deleteTrip, type Trip } from "@/services/tripService";
import { Plane, AlertCircle, ArrowRight } from "lucide-react";

export default function TripsPage() {
	const router = useRouter();
	const [trips, setTrips] = useState<Trip[]>([]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("kelana_token");
		if (!token) {
			router.push("/login");
			return;
		}

		apiRequest<Trip[]>("/api/v1/trips")
			.then((data) => setTrips(data))
			.catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load your trips."))
			.finally(() => setIsLoading(false));
	}, [router]);

	const removeTrip = async (tripId: number) => {
		try {
			await deleteTrip(tripId);
			setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== tripId));
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to delete this trip.");
			throw requestError;
		}
	};

	return (
		<main className="history-shell">
			<Navbar active="trips" />
			<section className="history-intro">
				<p className="eyebrow">YOUR TRAVEL ARCHIVE</p>
				<h1>Trip history</h1>
				<p>Every itinerary you have shaped, gathered in one place.</p>
			</section>
			{isLoading ? (
				<div className="empty-state compact">
					<span className="empty-icon">
						<Plane size={32} />
					</span>
					<h2>Loading your trips…</h2>
				</div>
			) : error ? (
				<div className="empty-state error-state">
					<span className="empty-icon">
						<AlertCircle size={32} />
					</span>
					<h2>We could not reach your trips.</h2>
					<p>{error}</p>
					<Link className="primary-link" href="/login">
						Try again
						<ArrowRight size={18} />
					</Link>
				</div>
			) : trips.length === 0 ? (
				<div className="empty-state">
					<span className="empty-icon">
						<Plane size={32} />
					</span>
					<h2>No trips found.</h2>
					<p>Create your first itinerary and give the next journey somewhere to begin.</p>
					<Link className="primary-link" href="/planner">
						Generate a trip
						<ArrowRight size={18} />
					</Link>
				</div>
			) : (
				<TripList trips={trips} onDelete={removeTrip} />
			)}
			<Footer />
		</main>
	);
}
