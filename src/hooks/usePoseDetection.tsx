import { useRef, useEffect, useState, useCallback } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

interface PoseResults {
  poseLandmarks?: any;
  poseWorldLandmarks?: any;
}

interface RepCounterState {
  phase: 'up' | 'down' | 'transition';
  count: 0;
  lastAngle: number;
  consecutiveFramesInPhase: number;
}

interface UsePoseDetectionProps {
  exerciseName: string;
  onRepComplete?: (repCount: number, accuracy: number) => void;
  onFeedback?: (feedback: string, quality: 'good' | 'warning' | 'error') => void;
}

export const usePoseDetection = ({ 
  exerciseName, 
  onRepComplete, 
  onFeedback 
}: UsePoseDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const repCounterRef = useRef<RepCounterState>({
    phase: 'up',
    count: 0,
    lastAngle: 0,
    consecutiveFramesInPhase: 0
  });

  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState('Position yourself in frame to begin');
  const [poseQuality, setPoseQuality] = useState<'good' | 'warning' | 'error'>('warning');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate angle between three points
  const calculateAngle = useCallback((a: any, b: any, c: any): number => {
    if (!a || !b || !c || a.visibility < 0.5 || b.visibility < 0.5 || c.visibility < 0.5) {
      return 0;
    }

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }, []);

  // Get key angle based on exercise type
  const getKeyAngle = useCallback((landmarks: any): number => {
    if (!landmarks || landmarks.length < 33) return 0;

    switch (exerciseName.toLowerCase()) {
      case 'squats':
        // Knee angle (hip -> knee -> ankle)
        return calculateAngle(
          landmarks[23], // left hip
          landmarks[25], // left knee  
          landmarks[27]  // left ankle
        );
      
      case 'push-ups':
        // Elbow angle (shoulder -> elbow -> wrist)
        return calculateAngle(
          landmarks[11], // left shoulder
          landmarks[13], // left elbow
          landmarks[15]  // left wrist
        );
      
      case 'planks':
        // Hip angle for plank (shoulder -> hip -> knee)
        return calculateAngle(
          landmarks[11], // left shoulder
          landmarks[23], // left hip
          landmarks[25]  // left knee
        );
      
      default:
        return calculateAngle(
          landmarks[11], // default to shoulder
          landmarks[13], // elbow
          landmarks[15]  // wrist
        );
    }
  }, [exerciseName, calculateAngle]);

  // Finite State Machine for rep counting
  const updateRepCount = useCallback((currentAngle: number) => {
    const counter = repCounterRef.current;
    const minFramesInPhase = 5; // Require consistency to avoid false counts
    
    let newPhase = counter.phase;
    let newCount = counter.count;
    let consecutiveFrames = counter.consecutiveFramesInPhase;

    // Exercise-specific thresholds
    let upThreshold = 160;
    let downThreshold = 90;
    
    switch (exerciseName.toLowerCase()) {
      case 'squats':
        upThreshold = 160; // Standing up
        downThreshold = 90; // Squatting down
        break;
      case 'push-ups':
        upThreshold = 160; // Arms extended
        downThreshold = 90; // Arms bent
        break;
      case 'planks':
        // For planks, we're looking for holding position, not counting reps
        return;
    }

    // State machine logic
    if (counter.phase === 'up' && currentAngle < downThreshold) {
      if (consecutiveFrames >= minFramesInPhase) {
        newPhase = 'down';
        consecutiveFrames = 0;
      } else {
        consecutiveFrames++;
      }
    } else if (counter.phase === 'down' && currentAngle > upThreshold) {
      if (consecutiveFrames >= minFramesInPhase) {
        newPhase = 'up';
        newCount++;
        consecutiveFrames = 0;
        
        // Calculate accuracy for this rep
        const angleDeviation = Math.abs(currentAngle - upThreshold);
        const repAccuracy = Math.max(0, 100 - (angleDeviation / 10) * 20);
        
        setRepCount(newCount);
        setAccuracy(prev => (prev + repAccuracy) / 2); // Running average
        onRepComplete?.(newCount, repAccuracy);
      } else {
        consecutiveFrames++;
      }
    } else {
      // Reset consecutive frames if we're not in a transition
      consecutiveFrames = 0;
    }

    repCounterRef.current = {
      phase: newPhase,
      count: newCount,
      lastAngle: currentAngle,
      consecutiveFramesInPhase: consecutiveFrames
    };
  }, [exerciseName, onRepComplete]);

  // Generate feedback based on pose analysis
  const generateFeedback = useCallback((landmarks: any, currentAngle: number) => {
    if (!landmarks || landmarks.length < 33) {
      setFeedback('Position yourself in frame');
      setPoseQuality('warning');
      return;
    }

    let feedbackText = '';
    let quality: 'good' | 'warning' | 'error' = 'good';

    switch (exerciseName.toLowerCase()) {
      case 'squats':
        if (currentAngle < 70) {
          feedbackText = 'Great depth! Perfect squat form';
          quality = 'good';
        } else if (currentAngle < 100) {
          feedbackText = 'Good form, try to go a bit deeper';
          quality = 'warning';
        } else if (currentAngle > 160) {
          feedbackText = 'Stand up straight, engage your glutes';
          quality = 'good';
        } else {
          feedbackText = 'Keep your knees aligned with your toes';
          quality = 'warning';
        }
        break;
        
      case 'push-ups':
        if (currentAngle < 70) {
          feedbackText = 'Excellent range of motion!';
          quality = 'good';
        } else if (currentAngle < 110) {
          feedbackText = 'Good depth, try to go lower';
          quality = 'warning';
        } else if (currentAngle > 150) {
          feedbackText = 'Perfect arm extension!';
          quality = 'good';
        } else {
          feedbackText = 'Keep your core engaged';
          quality = 'warning';
        }
        break;
        
      case 'planks':
        if (currentAngle > 160 && currentAngle < 185) {
          feedbackText = 'Perfect plank alignment!';
          quality = 'good';
        } else if (currentAngle < 160) {
          feedbackText = 'Lift your hips up';
          quality = 'warning';
        } else {
          feedbackText = 'Lower your hips slightly';
          quality = 'warning';
        }
        break;
        
      default:
        feedbackText = 'Keep focusing on your form';
        quality = 'good';
    }

    setFeedback(feedbackText);
    setPoseQuality(quality);
    onFeedback?.(feedbackText, quality);
  }, [exerciseName, onFeedback]);

  // Process pose results
  const onResults = useCallback((results: PoseResults) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      // Calculate key angle and update rep count
      const currentAngle = getKeyAngle(results.poseLandmarks);
      updateRepCount(currentAngle);
      generateFeedback(results.poseLandmarks, currentAngle);

      // Draw pose landmarks
      drawPoseLandmarks(canvasCtx, results.poseLandmarks, canvasElement);
    }

    canvasCtx.restore();
  }, [getKeyAngle, updateRepCount, generateFeedback]);

  // Draw pose landmarks on canvas
  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[], canvas: HTMLCanvasElement) => {
    // Draw keypoints
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = landmark.visibility > 0.8 ? '#00ff00' : '#ffff00';
        ctx.fill();
      }
    });

    // Draw connections between key points for current exercise
    const connections = getExerciseConnections(exerciseName);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint?.visibility > 0.5 && endPoint?.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      }
    });
  };

  // Get exercise-specific pose connections
  const getExerciseConnections = (exercise: string): [number, number][] => {
    switch (exercise.toLowerCase()) {
      case 'squats':
        return [
          [11, 23], [12, 24], // shoulders to hips
          [23, 25], [24, 26], // hips to knees  
          [25, 27], [26, 28], // knees to ankles
        ];
      case 'push-ups':
        return [
          [11, 13], [12, 14], // shoulders to elbows
          [13, 15], [14, 16], // elbows to wrists
          [11, 12], // shoulder connection
        ];
      case 'planks':
        return [
          [11, 12], // shoulders
          [11, 23], [12, 24], // shoulders to hips
          [23, 24], // hips
          [23, 25], [24, 26], // hips to knees
        ];
      default:
        return [
          [11, 13], [12, 14], // shoulders to elbows
          [13, 15], [14, 16], // elbows to wrists
        ];
    }
  };

  // Initialize MediaPipe Pose
  const initializePose = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(onResults);
      poseRef.current = pose;

    } catch (err) {
      console.error('Error initializing pose:', err);
      setError('Failed to initialize AI pose detection');
    } finally {
      setIsLoading(false);
    }
  }, [onResults]);

  // Start camera and pose detection
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for HTTPS in production
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera requires HTTPS or localhost');
      }

      // Initialize pose if not already done
      if (!poseRef.current) {
        await initializePose();
      }

      if (!videoRef.current || !poseRef.current) {
        throw new Error('Video element or pose not initialized');
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Initialize camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      cameraRef.current = camera;
      camera.start();
      
      setIsActive(true);
      setFeedback('AI analyzing your form...');
      
    } catch (err: any) {
      console.error('Error starting camera:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.message.includes('HTTPS')) {
        setError('Camera requires HTTPS. Please use https:// or localhost.');
      } else {
        setError('Failed to access camera. Please check your browser settings.');
      }
      
      setFeedback('Camera error - check permissions');
    } finally {
      setIsLoading(false);
    }
  }, [initializePose]);

  // Stop camera and pose detection
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setFeedback('Camera stopped');
    
    // Reset rep counter
    repCounterRef.current = {
      phase: 'up',
      count: 0,
      lastAngle: 0,
      consecutiveFramesInPhase: 0
    };
    setRepCount(0);
    setAccuracy(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
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
  };
};