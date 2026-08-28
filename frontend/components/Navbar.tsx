import Link from "next/link";

export default function Navbar({ active = "" }: { active?: string }) {

	return <header className="site-nav">
		<Link className="brand" href="/"><span className="brand-mark">K</span><span>Kelana<span className="brand-accent">AI</span></span></Link>
		<nav aria-label="Main navigation">
			<Link className={active === "trips" ? "active" : ""} href="/trips">My trips</Link>
			<Link className="nav-cta" href="/#planner">Create trip <span aria-hidden="true">↗</span></Link>
		</nav>
	</header>;
}