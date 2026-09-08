import Link from "next/link";

export default function Footer() {
	return (
		<footer className="site-footer">
			<div className="footer-container">
				<div className="footer-main">
					<div className="footer-brand">
						<div className="footer-logo">
							<span className="brand-mark">K</span>
							<span>Kelana<span className="brand-accent">AI</span></span>
						</div>
						<p className="footer-tagline">Made for curious travelers.</p>
					</div>

					<nav className="footer-links" aria-label="Footer navigation">
						<div className="footer-links-group">
							<h3 className="footer-heading">Product</h3>
							<Link href="/#planner">Plan a Trip</Link>
							<Link href="/trips">My Trips</Link>
							<Link href="/assistant">Ask AI</Link>
							<Link href="/chat">AI Chat</Link>
						</div>

						<div className="footer-links-group">
							<h3 className="footer-heading">Company</h3>
							<Link href="/about">About</Link>
							<a href="mailto:hello@kelana.ai">Contact</a>
						</div>

						<div className="footer-links-group">
							<h3 className="footer-heading">Legal</h3>
							<Link href="/privacy">Privacy</Link>
							<Link href="/terms">Terms</Link>
						</div>
					</nav>
				</div>

				<div className="footer-bottom">
					<p>© 2026 KelanaAI. All rights reserved.</p>
					<div className="footer-social">
						{/* Future: Add social links here */}
					</div>
				</div>
			</div>
		</footer>
	);
}