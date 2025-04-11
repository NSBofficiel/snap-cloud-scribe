
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera as CameraIcon, RotateCw, Loader2 } from "lucide-react";

interface CameraProps {
  onPhotoCapture: (photoData: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onPhotoCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const { toast } = useToast();

  useEffect(() => {
    const startCamera = async () => {
      setIsLoading(true);
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, toast]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoData = canvas.toDataURL("image/jpeg");
    onPhotoCapture(photoData);

    toast({
      title: "Photo captured!",
      description: "Your photo has been saved to the gallery.",
    });
  };

  const toggleCamera = () => {
    setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
  };

  return (
    <div className="camera-container w-full aspect-[4/3] bg-black relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
      
      <div className="camera-controls gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          onClick={toggleCamera}
        >
          <RotateCw className="h-5 w-5" />
        </Button>
        
        <Button 
          onClick={capturePhoto}
          disabled={isLoading || !stream}
          size="lg"
          className="rounded-full h-16 w-16 bg-white hover:bg-white/90"
        >
          <CameraIcon className="h-8 w-8 text-primary" />
        </Button>
      </div>
    </div>
  );
};

export default Camera;
