"use client";

import Link from "next/link";
import { useState } from "react";
import type { Trip } from "@/services/tripService";

export default function TripCard({ trip, onDelete }: { trip: Trip; onDelete?: (id: number) => Promise<void> }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const categoryClass = trip.category.toLowerCase();
	const destinationFlag = trip.country.toLowerCase() === "japan" ? "🇯🇵" : trip.country.toLowerCase() === "indonesia" ? "🇮🇩" : "✈";
	const handleDelete = async () => {
		if (!onDelete || !window.confirm("Delete this saved trip? This cannot be undone.")) return;
		setIsDeleting(true);
		try { await onDelete(trip.id); } finally { setIsDeleting(false); }
	};
	return (
		<article className="trip-card">
			<div className="trip-card-icon" aria-hidden="true">{destinationFlag}</div>
			<div className="trip-card-content">
				<div className="trip-card-heading">
					<div>
							<p className="eyebrow">{trip.season}</p>
						<h3>{trip.destinations.join(" · ")}</h3>
					</div>
					<span className="trip-card-country">{trip.country}</span>
				</div>
				<div className="trip-badges"><span className={`category-badge ${categoryClass}`}>{trip.category}</span><span className="style-badge">{trip.travel_style}</span></div>
				<p className="trip-card-meta">{trip.days} days · {trip.daily_budget.toLocaleString()} {trip.currency}/day</p>
				<div className="trip-card-footer">
					<span>{trip.total_estimated_cost.toLocaleString()} {trip.currency} estimated</span>
					<div className="trip-card-actions"><Link href={`/trips/${trip.id}`}>View details <span aria-hidden="true">→</span></Link>{onDelete ? <button type="button" className="card-delete-button" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete"}</button> : null}</div>
				</div>
			</div>
		</article>
	);
}
