import Link from "next/link";

export default function Footer() {
	return <footer className="site-footer"><p>© 2026 KelanaAI. Made for curious travelers.</p><nav aria-label="Footer navigation"><Link href="/trips">My trips</Link><Link href="/#planner">Plan a trip</Link><a href="mailto:hello@kelana.ai">Contact</a></nav></footer>;
}