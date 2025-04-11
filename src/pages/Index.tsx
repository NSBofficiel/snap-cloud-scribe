
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera as CameraIcon, Image, Upload } from "lucide-react";
import Camera from "@/components/Camera";
import PhotoGallery, { Photo } from "@/components/PhotoGallery";
import { v4 as uuid } from "uuid";
import FileUpload from "@/components/FileUpload";

// Simulate cloud upload with local storage
const simulateCloudUpload = async (photoData: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState("camera");
  const { toast } = useToast();

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem("cloudPhotos");
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (error) {
        console.error("Error loading saved photos:", error);
      }
    }
  }, []);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cloudPhotos", JSON.stringify(photos));
  }, [photos]);

  const handlePhotoCapture = (photoData: string) => {
    const newPhoto: Photo = {
      id: uuid(),
      imageData: photoData,
      caption: "",
      uploaded: false,
    };
    
    setPhotos(prev => [newPhoto, ...prev]);
    setActiveTab("gallery");
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const photoData = e.target.result as string;
        const newPhoto: Photo = {
          id: uuid(),
          imageData: photoData,
          caption: file.name || "",
          uploaded: false,
        };
        
        setPhotos(prev => [newPhoto, ...prev]);
        setActiveTab("gallery");
        
        toast({
          title: "Photo uploaded",
          description: "Your photo has been added to the gallery.",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePhoto = (id: string, caption: string) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, caption } : photo
      )
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    toast({
      title: "Photo deleted",
      description: "The photo has been removed from your gallery.",
    });
  };

  const handleUploadPhoto = async (id: string) => {
    // Find the photo to upload
    const photoToUpload = photos.find(photo => photo.id === id);
    if (!photoToUpload) return;

    // Set loading state for this photo
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, uploading: true } : photo
      )
    );
    
    toast({
      title: "Uploading photo...",
      description: "Your photo is being uploaded to the cloud.",
    });

    try {
      // Simulate cloud upload
      const success = await simulateCloudUpload(photoToUpload.imageData);
      
      if (success) {
        setPhotos(prev => 
          prev.map(photo => 
            photo.id === id ? { ...photo, uploaded: true, uploading: false } : photo
          )
        );
        
        toast({
          title: "Upload complete",
          description: "Your photo has been successfully saved to the cloud.",
        });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
      
      setPhotos(prev => 
        prev.map(photo => 
          photo.id === id ? { ...photo, uploading: false } : photo
        )
      );
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          SnapCloud
        </h1>
        <p className="text-muted-foreground">Capture, store, remember.</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <CameraIcon className="h-4 w-4" />
            <span>Camera</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Gallery</span>
            {photos.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary-foreground px-2 py-0.5 text-xs">
                {photos.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="mt-0">
          <div className="rounded-md overflow-hidden shadow-lg">
            <Camera onPhotoCapture={handlePhotoCapture} />
          </div>
          
          <div className="my-6">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("gallery")} 
              disabled={photos.length === 0}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              <span>View Gallery ({photos.length})</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-0">
          <div className="min-h-[400px]">
            <PhotoGallery 
              photos={photos}
              onUpdatePhoto={handleUpdatePhoto}
              onDeletePhoto={handleDeletePhoto}
              onUploadPhoto={handleUploadPhoto}
            />
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => setActiveTab("camera")} 
              className="flex items-center gap-2"
            >
              <CameraIcon className="h-4 w-4" />
              <span>Take a New Photo</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
