import Link from "next/link";
import type { Trip } from "@/services/tripService";

export default function TripCard({ trip }: { trip: Trip }) {
	const categoryClass = trip.category.toLowerCase();
	const destinationFlag = trip.country.toLowerCase() === "japan" ? "🇯🇵" : trip.country.toLowerCase() === "indonesia" ? "🇮🇩" : "✈";
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
					<Link href={`/trips/${trip.id}`}>View details <span aria-hidden="true">→</span></Link>
				</div>
			</div>
		</article>
	);
}
