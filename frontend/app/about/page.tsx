import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
	return (
		<main className="about-shell">
			<Navbar active="" />

			{/* Hero Section */}
			<section className="about-hero">
				<div className="about-hero-content">
					<p className="eyebrow">ABOUT KELANAAI</p>
					<h1>Travel planning that feels personal</h1>
					<p className="about-hero-subtitle">
						We believe every journey should be as unique as the traveler taking it. KelanaAI combines the power of AI with real travel knowledge to design trips worth remembering.
					</p>
				</div>
				<div className="about-hero-image">
					<div className="hero-image-placeholder">
						<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="400" height="300" rx="16" fill="url(#gradient1)" />
							<circle cx="100" cy="80" r="40" fill="white" opacity="0.2" />
							<circle cx="300" cy="220" r="60" fill="white" opacity="0.15" />
							<path d="M50 150 Q200 100 350 150" stroke="white" strokeWidth="3" opacity="0.3" />
							<circle cx="200" cy="150" r="50" fill="white" opacity="0.25" />
							<defs>
								<linearGradient id="gradient1" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
									<stop stopColor="#3ea997" />
									<stop offset="1" stopColor="#28715f" />
								</linearGradient>
							</defs>
						</svg>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="about-mission">
				<div className="mission-content">
					<h2>Our mission</h2>
					<p className="mission-statement">
						To make thoughtful travel planning accessible to everyone. We&apos;re building technology that understands your style, respects your budget, and designs itineraries that feel authentic — not algorithmic.
					</p>
				</div>
			</section>

			{/* Features Grid */}
			<section className="about-features">
				<h2 className="features-heading">What makes us different</h2>
				<div className="features-grid">
					<article className="feature-card">
						<div className="feature-icon">🧠</div>
						<h3>AI that understands context</h3>
						<p>
							Our AI doesn&apos;t just generate generic lists. It considers your travel style, budget constraints, and seasonal factors to create personalized recommendations.
						</p>
					</article>

					<article className="feature-card">
						<div className="feature-icon">💬</div>
						<h3>Conversational planning</h3>
						<p>
							Ask questions, refine ideas, and explore alternatives through natural conversation. Your travel assistant remembers the thread.
						</p>
					</article>

					<article className="feature-card">
						<div className="feature-icon">📚</div>
						<h3>Grounded in knowledge</h3>
						<p>
							Access curated travel information with source citations. Get answers backed by trusted travel documents, not hallucinations.
						</p>
					</article>

					<article className="feature-card">
						<div className="feature-icon">🎨</div>
						<h3>Design, not just data</h3>
						<p>
							Beautiful, thoughtful interfaces that make trip planning feel inspiring rather than overwhelming. Details matter.
						</p>
					</article>

					<article className="feature-card">
						<div className="feature-icon">🔄</div>
						<h3>Flexible and adaptive</h3>
						<p>
							Change your mind? Update your budget or dates and watch your itinerary regenerate instantly to match your new plan.
						</p>
					</article>

					<article className="feature-card">
						<div className="feature-icon">🔒</div>
						<h3>Privacy-first approach</h3>
						<p>
							Your travel plans are yours. We don&apos;t sell your data, track you across the web, or share your information with third parties.
						</p>
					</article>
				</div>
			</section>

			{/* Technology Section */}
			<section className="about-technology">
				<div className="technology-content">
					<div className="technology-text">
						<p className="eyebrow">POWERED BY</p>
						<h2>Modern AI technology</h2>
						<p>
							KelanaAI is built on Amazon Bedrock, giving you access to cutting-edge language models that understand travel context, generate creative itineraries, and provide grounded answers from trusted sources.
						</p>
						<ul className="technology-list">
							<li>Amazon Nova for intelligent trip generation</li>
							<li>Knowledge bases for factual, cited responses</li>
							<li>Conversational memory for natural interactions</li>
							<li>Real-time regeneration as your plans evolve</li>
						</ul>
					</div>
					<div className="technology-visual">
						<div className="tech-badge">
							<span className="tech-badge-icon">⚡</span>
							<div>
								<strong>Amazon Bedrock</strong>
								<span>Enterprise-grade AI</span>
							</div>
						</div>
						<div className="tech-badge">
							<span className="tech-badge-icon">🔍</span>
							<div>
								<strong>Knowledge Bases</strong>
								<span>Grounded retrieval</span>
							</div>
						</div>
						<div className="tech-badge">
							<span className="tech-badge-icon">💡</span>
							<div>
								<strong>Nova Models</strong>
								<span>Creative generation</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="about-cta">
				<div className="cta-content">
					<h2>Ready to plan your next adventure?</h2>
					<p>Join travelers who are discovering smarter, more personal ways to explore the world.</p>
					<div className="cta-actions">
						<Link href="/register" className="cta-button primary">
							Get started free
						</Link>
						<Link href="/#planner" className="cta-button secondary">
							Try the planner
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}
