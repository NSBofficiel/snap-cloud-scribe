
import React, { useState, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, RefreshCw } from "lucide-react";
import { photoService } from "@/integrations/supabase/photos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Photo } from "@/integrations/supabase/photos";
import { Button } from "./ui/button";

interface PhotoGalleryProps {
  onUpdatePhoto?: (id: string, caption: string) => void;
  onDeletePhoto?: (id: string) => void;
  onUploadPhoto?: (id: string) => Promise<void>;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  onUpdatePhoto, 
  onDeletePhoto, 
  onUploadPhoto 
}) => {
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [sharedPhotos, setSharedPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState<'my-photos' | 'shared-photos'>('my-photos');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const myPhotosList = await photoService.getMyPhotos();
      const sharedPhotosList = await photoService.getSharedPhotos();
      
      console.log("My photos:", myPhotosList);
      console.log("Shared photos:", sharedPhotosList);
      
      setMyPhotos(myPhotosList);
      setSharedPhotos(sharedPhotosList);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleToggleVisibility = async (photoId: string, currentVisibility: 'public' | 'private') => {
    const newVisibility = currentVisibility === 'private' ? 'public' : 'private' as 'public' | 'private';
    const updatedPhoto = await photoService.updatePhotoVisibility(photoId, newVisibility);
    
    if (updatedPhoto) {
      setMyPhotos(prev => 
        prev.map(photo => 
          photo.id === photoId ? { ...photo, visibility: newVisibility } : photo
        )
      );
      
      // Refresh shared photos if we're making a photo public/private
      if (activeTab === 'shared-photos' || newVisibility === 'public') {
        const sharedPhotosList = await photoService.getSharedPhotos();
        setSharedPhotos(sharedPhotosList);
      }
    }
  };

  const handleDelete = async (photoId: string) => {
    if (onDeletePhoto) {
      onDeletePhoto(photoId);
    }
    
    // Remove from local state
    setMyPhotos(prev => prev.filter(photo => photo.id !== photoId));
    setSharedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const renderPhotoGrid = (photos: Photo[]) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-64">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading photos...</p>
        </div>
      );
    }

    if (photos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-64 border border-dashed rounded-md">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="font-medium mb-1">No photos yet</h3>
          <p className="text-sm text-muted-foreground text-center">
            {activeTab === 'my-photos' 
              ? 'Capture photos using the camera to see them here.' 
              : 'No shared photos available.'}
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-full w-full pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {photos.map((photo) => (
            <div key={photo.id} className="fade-in">
              <PhotoCard
                id={photo.id}
                imageData={photo.image_data}
                caption={photo.caption}
                visibility={photo.visibility as 'public' | 'private'}
                onToggleVisibility={() => handleToggleVisibility(photo.id, photo.visibility as 'public' | 'private')}
                onDelete={() => handleDelete(photo.id)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'my-photos' | 'shared-photos')} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="my-photos">My Photos</TabsTrigger>
            <TabsTrigger value="shared-photos">Shared Photos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="ml-2"
          onClick={fetchPhotos}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <TabsContent value="my-photos" className="mt-2">
        {renderPhotoGrid(myPhotos)}
      </TabsContent>
      
      <TabsContent value="shared-photos" className="mt-2">
        {renderPhotoGrid(sharedPhotos)}
      </TabsContent>
    </div>
  );
};

export default PhotoGallery;
