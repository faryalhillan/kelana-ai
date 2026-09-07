type LoadingScreenProps = {
	message?: string;
	fullScreen?: boolean;
};

export default function LoadingScreen({ 
	message = "Loading...", 
	fullScreen = false 
}: LoadingScreenProps) {
	return (
		<div className={`loading-screen ${fullScreen ? "fullscreen" : ""}`}>
			<div className="loading-screen-content">
				<div className="loading-brand">
					<div className="loading-brand-mark">K</div>
					<div className="loading-pulse-ring"></div>
					<div className="loading-pulse-ring delay-1"></div>
					<div className="loading-pulse-ring delay-2"></div>
				</div>
				<p className="loading-message">{message}</p>
				<div className="loading-dots">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</div>
	);
}
