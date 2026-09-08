import { Loader2 } from "lucide-react";

type LoadingScreenProps = {
  fullscreen?: boolean;
  message?: string;
};

export default function LoadingScreen({ fullscreen = false, message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className={`loading-screen ${fullscreen ? "fullscreen" : ""}`}>
      <div className="loading-screen-content">
        <div className="loading-brand">
          <div className="loading-brand-mark">
            <span>K</span>
          </div>
          <Loader2 
            className="absolute w-full h-full animate-spin text-coral" 
            style={{ opacity: 0.3 }} 
          />
        </div>
        <p className="text-muted font-medium">{message}</p>
      </div>
    </div>
  );
}
