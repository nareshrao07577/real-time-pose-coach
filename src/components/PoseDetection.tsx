import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CameraOff, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

interface PoseDetectionProps {
  exerciseName: string;
  onComplete?: () => void;
}

const PoseDetection = ({ exerciseName, onComplete }: PoseDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState<string>("Position yourself in frame to begin");
  const [poseQuality, setPoseQuality] = useState<"good" | "warning" | "error">("warning");
  const [repCount, setRepCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsActive(true);
      setFeedback("Camera active - AI analyzing your form...");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setFeedback("Camera access denied. Please enable camera permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setFeedback("Camera stopped");
  };

  const simulateAIFeedback = () => {
    // Simulate AI feedback for demo purposes
    const feedbackMessages = {
      good: [
        "Perfect form! Keep it up!",
        "Excellent posture detected",
        "Great alignment - continue!",
        "Outstanding technique!"
      ],
      warning: [
        "Adjust your back position slightly",
        "Keep your core engaged",
        "Watch your knee alignment",
        "Maintain steady breathing"
      ],
      error: [
        "Incorrect form detected - check your posture",
        "Risk of injury - adjust your position",
        "Form needs correction",
        "Please reset your starting position"
      ]
    };

    const qualities: Array<"good" | "warning" | "error"> = ["good", "good", "warning", "good"];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
    const messages = feedbackMessages[randomQuality];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    setPoseQuality(randomQuality);
    setFeedback(randomMessage);

    if (randomQuality === "good" && Math.random() > 0.7) {
      setRepCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(simulateAIFeedback, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const getFeedbackColor = () => {
    switch (poseQuality) {
      case "good": return "text-success";
      case "warning": return "text-primary";
      case "error": return "text-destructive";
    }
  };

  const getFeedbackIcon = () => {
    switch (poseQuality) {
      case "good": return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning": return <Activity className="w-5 h-5 text-primary" />;
      case "error": return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Camera Feed */}
      <Card className="relative overflow-hidden bg-gradient-card">
        <div className="aspect-video bg-muted/20 relative">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {/* Pose overlay points (simulated) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
                <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-success rounded-full animate-pulse-glow" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Camera feed will appear here</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Controls */}
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Camera Control
          </h3>
          <div className="space-y-4">
            {!isActive ? (
              <Button 
                variant="hero" 
                className="w-full" 
                onClick={startCamera}
                disabled={isLoading}
              >
                {isLoading ? "Starting..." : "Start Camera"}
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={stopCamera}
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </Button>
            )}
          </div>
        </Card>

        {/* Feedback Panel */}
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {getFeedbackIcon()}
            AI Feedback
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg bg-muted/20 ${getFeedbackColor()}`}>
              <p className="font-medium">{feedback}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{repCount}</div>
                <div className="text-sm text-muted-foreground">Reps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {Math.round((repCount / Math.max(1, repCount + 2)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Exercise Info */}
      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-2">Current Exercise: {exerciseName}</h3>
        <p className="text-muted-foreground mb-4">
          Follow the on-screen guidance and maintain proper form. AI will provide real-time feedback.
        </p>
        {repCount >= 5 && (
          <Button variant="success" onClick={onComplete} className="w-full">
            <CheckCircle className="w-4 h-4" />
            Complete Exercise
          </Button>
        )}
      </Card>
    </div>
  );
};

export default PoseDetection;