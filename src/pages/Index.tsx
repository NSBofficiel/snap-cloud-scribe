
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera as CameraIcon, Image, User } from "lucide-react";
import Camera from "@/components/Camera";
import PhotoGallery from "@/components/PhotoGallery";
import FileUpload from "@/components/FileUpload";
import { Link } from "react-router-dom";
import { photoService } from "@/integrations/supabase/photos";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const { toast } = useToast();
  const { isGuest } = useAuth();

  const getUserInfo = () => {
    const isGuestUser = isGuest;
    const username = localStorage.getItem("snapcloud_username") || (isGuestUser ? "Guest" : "User");
    return { 
      username, 
      isGuest: isGuestUser,
      photoUrl: localStorage.getItem("snapcloud_photo") || undefined
    };
  };

  const userInfo = getUserInfo();

  const handlePhotoCapture = async (photoData: string) => {
    try {
      // Set visibility based on user type - guest photos are public by default
      const visibility = isGuest ? "public" : "private";
      
      const newPhoto = await photoService.uploadPhoto({
        image_data: photoData,
        caption: "",
        visibility: visibility as 'public' | 'private'
      });
      
      if (newPhoto) {
        setActiveTab("gallery");
        toast({
          title: "Photo captured",
          description: "Your photo has been added to the gallery.",
        });
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
          // Set visibility based on user type - guest photos are public by default
          const visibility = isGuest ? "public" : "private";
          
          const newPhoto = await photoService.uploadPhoto({
            image_data: photoData,
            caption: file.name || "",
            visibility: visibility as 'public' | 'private'
          });
          
          if (newPhoto) {
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
    // To be implemented
    toast({
      title: "Caption updated",
      description: "Your photo caption has been updated.",
    });
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      const success = await photoService.deletePhoto(id);
      
      if (success) {
        toast({
          title: "Photo deleted",
          description: "The photo has been removed from your gallery.",
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting your photo.",
        variant: "destructive",
      });
    }
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
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              <span>View Gallery</span>
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
