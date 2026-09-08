import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
	return (
		<main className="history-shell">
			<Navbar active="" />
			<section className="history-intro">
				<p className="eyebrow">LEGAL</p>
				<h1>Terms of Service</h1>
				<p>The terms and conditions for using KelanaAI.</p>
			</section>

			<div className="empty-state compact">
				<span className="empty-icon">📄</span>
				<h2>Terms of Service Coming Soon</h2>
				<p>We're preparing our terms of service. By using KelanaAI, you agree to use our service responsibly and respectfully.</p>
				<Link className="primary-link" href="/">Back to Home <span aria-hidden="true">→</span></Link>
			</div>

			<Footer />
		</main>
	);
}
