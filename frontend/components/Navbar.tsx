"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getAuthToken, getProfile } from "@/services/authService";
import { User, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

// Add a simple cache for user profile to avoid repeated API calls
let profileCache: { name: string; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Navbar({ active = "" }: { active?: string }) {
	const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
	const [userName, setUserName] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	
	// Determine if we're on the landing page
	const isLandingPage = pathname === "/";

	const checkAuth = useCallback(async () => {
		const token = getAuthToken();
		
		if (!token) {
			setAuthState("unauthenticated");
			profileCache = null;
			return;
		}

		// Check if we have cached profile data that's still valid
		if (profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
			setUserName(profileCache.name);
			setAuthState("authenticated");
			return;
		}

		try {
			const profile = await getProfile();
			const name = profile.name || "Traveler";
			
			// Cache the profile data
			profileCache = {
				name,
				timestamp: Date.now()
			};
			
			setUserName(name);
			setAuthState("authenticated");
		} catch {
			// If profile fetch fails, still show as authenticated with fallback name
			const fallbackName = "Traveler";
			setUserName(fallbackName);
			setAuthState("authenticated");
			
			// Cache the fallback too
			profileCache = {
				name: fallbackName,
				timestamp: Date.now()
			};
		}
	}, []);

	useEffect(() => {
		// Check auth immediately on mount, without delay
		checkAuth();
	}, [checkAuth]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		}

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isDropdownOpen]);

	const handleLogout = useCallback(() => {
		setIsDropdownOpen(false);
		profileCache = null; // Clear cache on logout
		const { logout } = require("@/services/authService");
		logout();
	}, []);

	const toggleDropdown = useCallback(() => {
		setIsDropdownOpen(prev => !prev);
	}, []);

	return (
		<header className="site-nav">
			<div className="nav-container">
				{/* Logo - clickable to home */}
				<Link className="brand" href="/" aria-label="KelanaAI Home">
					<span className="brand-mark">K</span>
					<span>Kelana<span className="brand-accent">AI</span></span>
				</Link>

				{/* Main Navigation - Different links for landing vs app pages */}
				<nav aria-label="Main navigation" className="nav-links">
					{isLandingPage ? (
						<>
							<Link 
								className={`nav-link ${active === "how-it-works" ? "active" : ""}`} 
								href="/#how-it-works"
							>
								<span className="nav-link-text">How It Works</span>
							</Link>
							<Link 
								className={`nav-link ${active === "features" ? "active" : ""}`} 
								href="/#features"
							>
								<span className="nav-link-text">Features</span>
							</Link>
						</>
					) : (
						<>
							<Link 
								className={`nav-link ${active === "planner" ? "active" : ""}`} 
								href="/planner"
							>
								<span className="nav-link-text">Plan a Trip</span>
							</Link>
							<Link 
								className={`nav-link ${active === "trips" ? "active" : ""}`} 
								href="/trips"
							>
								<span className="nav-link-text">My Trips</span>
							</Link>
							<Link 
								className={`nav-link ${active === "assistant" ? "active" : ""}`} 
								href="/assistant"
							>
								<span className="nav-link-text">Ask AI</span>
							</Link>
							<Link 
								className={`nav-link ${active === "chat" ? "active" : ""}`} 
								href="/chat"
							>
								<span className="nav-link-text">AI Chat</span>
							</Link>
						</>
					)}
				</nav>

				{/* Auth Section */}
				<div className="nav-auth">
					<ThemeToggle />
					{authState === "loading" ? (
						<div className="auth-skeleton" aria-hidden="true">
							<div className="skeleton-avatar"></div>
							<div className="skeleton-text"></div>
						</div>
					) : authState === "authenticated" ? (
						<div className="user-dropdown" ref={dropdownRef}>
							<button
								type="button"
								className="user-dropdown-trigger"
								onClick={toggleDropdown}
								aria-expanded={isDropdownOpen}
								aria-haspopup="true"
							>
								<span className="user-avatar">{userName.charAt(0).toUpperCase()}</span>
								<span className="user-name">{userName}</span>
								<svg 
									className={`dropdown-chevron ${isDropdownOpen ? "open" : ""}`}
									width="14" 
									height="14" 
									viewBox="0 0 14 14" 
									fill="none"
									aria-hidden="true"
								>
									<path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</button>
							
							{isDropdownOpen && (
								<div className="user-dropdown-menu">
									<Link 
										href="/profile" 
										className="dropdown-item"
										onClick={() => setIsDropdownOpen(false)}
									>
										<User size={16} />
										Profile
									</Link>
									<button 
										type="button"
										className="dropdown-item logout"
										onClick={handleLogout}
									>
										<LogOut size={16} />
										Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<div className="auth-buttons">
							<Link href="/login" className="auth-btn login">Sign In</Link>
							<Link href="/register" className="auth-btn register">Get Started</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}