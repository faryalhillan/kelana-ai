"use client";

import Link from "next/link";
import { useState } from "react";
import type { Trip } from "@/services/tripService";
import Image from "next/image";
import { ArrowRight, Trash2 } from "lucide-react";

export default function TripCard({ trip, onDelete }: { trip: Trip; onDelete?: (id: number) => Promise<void> }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const categoryClass = trip.category.toLowerCase();
	
	// Use country flag from API if available, otherwise fallback to emoji
	const displayFlag = trip.country_emoji || "🌍";
	const flagImage = trip.country_flag;
	
	const handleDelete = async () => {
		if (!onDelete || !window.confirm("Delete this saved trip? This cannot be undone.")) return;
		setIsDeleting(true);
		try { await onDelete(trip.id); } finally { setIsDeleting(false); }
	};
	
	return (
		<article className="trip-card">
			<div className="trip-card-icon" aria-hidden="true">
				{flagImage ? (
					<Image 
						src={flagImage} 
						alt={`${trip.country} flag`}
						width={56}
						height={56}
						className="country-flag-image"
					/>
				) : (
					<span className="country-flag-emoji">{displayFlag}</span>
				)}
			</div>
			<div className="trip-card-content">
				<div className="trip-card-heading">
					<div>
						<p className="eyebrow">{trip.season}</p>
						<h3>{trip.destinations.join(" · ")}</h3>
					</div>
					<span className="trip-card-country">{trip.country}</span>
				</div>
				<div className="trip-badges">
					<span className={`category-badge ${categoryClass}`}>{trip.category}</span>
					<span className="style-badge">{trip.travel_style}</span>
				</div>
				<p className="trip-card-meta">{trip.days} days · {trip.daily_budget.toLocaleString()} {trip.currency}/day</p>
				<div className="trip-card-footer">
					<span>{trip.total_estimated_cost.toLocaleString()} {trip.currency} estimated</span>
					<div className="trip-card-actions">
						<Link href={`/trips/${trip.id}`}>
							View details
							<ArrowRight size={16} />
						</Link>
						{onDelete ? (
							<button 
								type="button" 
								className="card-delete-button" 
								onClick={handleDelete} 
								disabled={isDeleting}
							>
								<Trash2 size={14} />
								{isDeleting ? "Deleting…" : "Delete"}
							</button>
						) : null}
					</div>
				</div>
			</div>
		</article>
	);
}
