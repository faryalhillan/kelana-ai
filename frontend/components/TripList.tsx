"use client";

import { useMemo, useState } from "react";
import TripCard from "@/components/TripCard";
import type { Trip } from "@/services/tripService";

export default function TripList({ trips, onDelete }: { trips: Trip[]; onDelete?: (id: number) => Promise<void> }) {
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState("newest");
	const [page, setPage] = useState(1);
	const visibleTrips = useMemo(() => trips.filter((trip) => `${trip.destinations.join(" ")} ${trip.country} ${trip.travel_style}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "oldest" ? a.id - b.id : sort === "budget" ? b.budget - a.budget : b.id - a.id), [query, sort, trips]);
	const pageSize = 10;
	const pageCount = Math.ceil(visibleTrips.length / pageSize);
	const pageTrips = visibleTrips.slice((page - 1) * pageSize, page * pageSize);
	const updateQuery = (value: string) => { setQuery(value); setPage(1); };
	const updateSort = (value: string) => { setSort(value); setPage(1); };

	return <>
		<div className="trip-toolbar"><label className="search-field"><span className="sr-only">Search trips</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search destinations or travel style..." /></label><label className="sort-field"><span>Sort</span><select value={sort} onChange={(event) => updateSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="budget">Highest budget</option></select></label></div>
		{visibleTrips.length ? <><section className="trip-list" aria-label="Saved trips">{pageTrips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={onDelete} />)}</section>{pageCount > 1 && <nav className="pagination" aria-label="Trip pages"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next →</button></nav>}</> : <div className="empty-state compact"><span className="empty-icon">⌕</span><h2>No matching trips.</h2><p>Try another destination or travel style.</p></div>}
	</>;
}