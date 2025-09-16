import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CameraOff, CheckCircle, AlertCircle, Activity, RefreshCw, User } from "lucide-react";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBodyDiagram, getTargetedMuscles } from "@/utils/bodyDiagrams";

interface PoseDetectionProps {
  exerciseName: string;
  exerciseCategory: string;
  exerciseTags: string[];
  onComplete?: () => void;
}

const PoseDetection = ({ exerciseName, exerciseCategory, exerciseTags, onComplete }: PoseDetectionProps) => {
  const [sessionAccuracy, setSessionAccuracy] = useState(0);
  
  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    feedback,
    poseQuality,
    repCount,
    accuracy,
    startCamera,
    stopCamera
  } = usePoseDetection({
    exerciseName,
    onRepComplete: (count, repAccuracy) => {
      setSessionAccuracy(prev => (prev + repAccuracy) / 2);
    },
    onFeedback: (feedbackText, quality) => {
      // Additional feedback handling if needed
    }
  });

  const handleRetryCamera = () => {
    if (error) {
      startCamera();
    }
  };

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
      {/* Error Alert */}
      {error && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryCamera}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Feed */}
      <Card className="relative overflow-hidden bg-gradient-card">
        <div className="aspect-video bg-muted/20 relative">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover mirror"
                autoPlay
                muted
                playsInline
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                width={640}
                height={480}
                style={{ transform: 'scaleX(-1)' }}
              />
              {/* Live indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/80 text-destructive-foreground px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Camera feed will appear here</p>
                <p className="text-sm mt-2">Click "Start Camera" to begin pose detection</p>
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

        {/* Targeted Muscles & Feedback Panel */}
        <Card className="p-6 bg-gradient-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Targeted Muscles
          </h3>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <img
                src={getBodyDiagram(exerciseTags, exerciseCategory)}
                alt={`Body diagram showing targeted muscles`}
                className="w-16 h-20 object-contain bg-background/50 rounded border border-border/50"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1">
                {getTargetedMuscles(exerciseTags, exerciseCategory).map((muscle, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
            {getFeedbackIcon()}
            AI Feedback
          </h4>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg bg-muted/20 ${getFeedbackColor()}`}>
              <p className="font-medium">{feedback}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{repCount}</div>
                <div className="text-sm text-muted-foreground">Reps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {Math.round(accuracy)}%
                </div>
                <div className="text-sm text-muted-foreground">Form Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {Math.round(sessionAccuracy)}%
                </div>
                <div className="text-sm text-muted-foreground">Session Avg</div>
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