import Link from "next/link";
import type { Trip } from "@/services/tripService";

const countryFlags: Record<string, string> = {
	indonesia: "🇮🇩",
	japan: "🇯🇵",
	singapore: "🇸🇬",
	thailand: "🇹🇭",
	malaysia: "🇲🇾",
	"south korea": "🇰🇷",
	"united states": "🇺🇸",
	usa: "🇺🇸",
	france: "🇫🇷",
	italy: "🇮🇹",
};

function formatBudget(amount: number, currency: string) {
	return `${currency} ${amount.toLocaleString("en-US")}`;
}

export default function TripCard({ trip }: { trip: Trip }) {
	const categoryClass = trip.category.toLowerCase().replace(/\s+/g, "-");
	const destinationFlag = countryFlags[trip.country.trim().toLowerCase()] ?? "✈";
	return (
		<article className="trip-card">
			<div className="trip-card-icon" aria-label={`${trip.country} destination`} role="img">{destinationFlag}</div>
			<div className="trip-card-content">
				<div className="trip-card-heading">
					<div>
							<p className="eyebrow">{trip.season}</p>
						<h3>{trip.destinations.join(" · ")}</h3>
					</div>
					<span className="trip-card-country">{trip.country}</span>
				</div>
				<div className="trip-badges"><span className={`category-badge ${categoryClass}`}>{trip.category}</span><span className="style-badge">{trip.travel_style}</span></div>
				<p className="trip-card-meta">{trip.days} days · {formatBudget(trip.daily_budget, trip.currency)}/day</p>
				<div className="trip-card-footer">
					<span>{formatBudget(trip.total_estimated_cost, trip.currency)} estimated</span>
					<Link href={`/trips/${trip.id}`}>View details <span aria-hidden="true">→</span></Link>
				</div>
			</div>
		</article>
	);
}
