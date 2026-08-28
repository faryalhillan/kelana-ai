import type { DailyPlan } from "@/services/tripService";

export default function DayCards({ days, currency }: { days: DailyPlan[]; currency: string }) {
	return <div className="daily-grid">{days.map((day) => <article className="daily-card" key={day.day}><div className="daily-card-top"><span>DAY {day.day}</span><strong>{day.estimated_cost.toLocaleString()} {currency}</strong></div><h3>{day.title}</h3>{[["Morning", day.morning], ["Afternoon", day.afternoon], ["Evening", day.evening]].map(([period, activities]) => <div className="activity-block" key={period as string}><h4>{period as string}</h4>{(activities as string[]).map((activity) => <p key={activity}>{activity}</p>)}</div>)}</article>)}</div>;
}