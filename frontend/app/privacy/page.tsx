import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
	return (
		<main className="history-shell">
			<Navbar active="" />
			<section className="history-intro">
				<p className="eyebrow">LEGAL</p>
				<h1>Privacy Policy</h1>
				<p>How we handle your data and protect your privacy.</p>
			</section>

			<div className="empty-state compact">
				<span className="empty-icon">🔒</span>
				<h2>Privacy Policy Coming Soon</h2>
				<p>We're working on a comprehensive privacy policy. In the meantime, know that we take your privacy seriously and never sell your data.</p>
				<Link className="primary-link" href="/">Back to Home <span aria-hidden="true">→</span></Link>
			</div>

			<Footer />
		</main>
	);
}
