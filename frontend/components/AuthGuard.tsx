"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/services/authService";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";

type AuthGuardProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
	showInlinePrompt?: boolean;
};

export default function AuthGuard({ 
	children, 
	fallback, 
	redirectTo,
	showInlinePrompt = true 
}: AuthGuardProps) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		const token = getAuthToken();
		const hasAuth = Boolean(token);
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsAuthenticated(hasAuth);

		if (!hasAuth && redirectTo) {
			// Delayed redirect with smooth transition
			const timer = setTimeout(() => {
				router.push(redirectTo);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [redirectTo, router]);

	// Still checking auth state
	if (isAuthenticated === null) {
		return (
			<div className="auth-guard-loading">
				<div className="loading-spinner-container">
					<span className="spinner" />
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// User is authenticated
	if (isAuthenticated) {
		return <>{children}</>;
	}

	// User is not authenticated - show custom fallback or inline prompt
	if (fallback) {
		return <>{fallback}</>;
	}

	if (showInlinePrompt) {
		return <AuthPrompt />;
	}

	return null;
}

function AuthPrompt() {
	return (
		<div className="auth-guard-prompt">
			<div className="auth-prompt-card">
				<div className="auth-prompt-icon">
					<Lock size={40} />
				</div>
				<h2>Sign in to continue</h2>
				<p>
					You need to be logged in to access this feature. Create an account or log in to start exploring personalized travel planning with KelanaAI.
				</p>
				<div className="auth-prompt-actions">
					<Link href="/login" className="auth-prompt-button primary">
						Log in
						<ArrowRight size={18} />
					</Link>
					<Link href="/register" className="auth-prompt-button secondary">
						Create account
					</Link>
				</div>
				<Link href="/" className="auth-prompt-back">
					<ArrowLeft size={16} />
					Back to home
				</Link>
			</div>
		</div>
	);
}
