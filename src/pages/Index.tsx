import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera as CameraIcon, Image, Upload, User } from "lucide-react";
import Camera from "@/components/Camera";
import PhotoGallery from "@/components/PhotoGallery";
import { v4 as uuid } from "uuid";
import FileUpload from "@/components/FileUpload";
import { Link } from "react-router-dom";
import { photoService } from "@/integrations/supabase/photos";
import type { Photo } from "@/integrations/supabase/photos";

const simulateCloudUpload = async (photoData: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState("camera");
  const { toast } = useToast();

  const getUserInfo = () => {
    const isGuest = localStorage.getItem("snapcloud_auth") === "guest";
    const username = localStorage.getItem("snapcloud_username") || (isGuest ? "Guest" : "User");
    return { 
      username, 
      isGuest,
      photoUrl: localStorage.getItem("snapcloud_photo") || undefined
    };
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    const fetchPhotos = async () => {
      const myPhotos = await photoService.getMyPhotos();
      setPhotos(myPhotos);
    };

    fetchPhotos();
  }, []);

  const handlePhotoCapture = async (photoData: string) => {
    try {
      const newPhoto = await photoService.uploadPhoto({
        image_data: photoData,
        caption: "",
        visibility: "private"
      });
      
      if (newPhoto) {
        setPhotos(prev => [newPhoto, ...prev]);
        setActiveTab("gallery");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        const photoData = e.target.result as string;
        
        try {
          const newPhoto = await photoService.uploadPhoto({
            image_data: photoData,
            caption: file.name || "",
            visibility: "private"
          });
          
          if (newPhoto) {
            setPhotos(prev => [newPhoto, ...prev]);
            setActiveTab("gallery");
            
            toast({
              title: "Photo uploaded",
              description: "Your photo has been added to the gallery.",
            });
          }
        } catch (error) {
          toast({
            title: "Upload failed",
            description: "There was an error uploading your photo.",
            variant: "destructive",
          });
        }
      }
    };
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error reading the file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePhoto = async (id: string, caption: string) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, caption } : photo
      )
    );
  };

  const handleDeletePhoto = async (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    toast({
      title: "Photo deleted",
      description: "The photo has been removed from your gallery.",
    });
  };

  const handleUploadPhoto = async (id: string) => {
    toast({
      title: "Upload complete",
      description: "Your photo has been saved to the cloud.",
    });
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            A.Eye
          </h1>
          <p className="text-muted-foreground">Capture, store, remember.</p>
        </div>
        
        <Link to="/account">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div>
              <p className="text-sm font-medium text-right">{userInfo.username}</p>
              {userInfo.isGuest && (
                <p className="text-xs text-muted-foreground text-right">Guest Account</p>
              )}
            </div>
            <Avatar>
              <AvatarImage src={userInfo.photoUrl} />
              <AvatarFallback>
                <User size={16} />
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>
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
