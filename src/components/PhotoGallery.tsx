
import React, { useState, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon } from "lucide-react";
import { photoService } from "@/integrations/supabase/photos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Photo {
  id?: string;
  imageData: string;
  caption: string;
  visibility: 'private' | 'public';
}

interface PhotoGalleryProps {
  onUpdatePhoto?: (id: string, caption: string) => void;
  onDeletePhoto?: (id: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = () => {
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [sharedPhotos, setSharedPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState<'my-photos' | 'shared-photos'>('my-photos');

  useEffect(() => {
    const fetchPhotos = async () => {
      const myPhotosList = await photoService.getMyPhotos();
      const sharedPhotosList = await photoService.getSharedPhotos();
      
      setMyPhotos(myPhotosList);
      setSharedPhotos(sharedPhotosList);
    };

    fetchPhotos();
  }, []);

  const handleToggleVisibility = async (photoId: string, currentVisibility: 'private' | 'public') => {
    const newVisibility = currentVisibility === 'private' ? 'public' : 'private';
    const updatedPhoto = await photoService.updatePhotoVisibility(photoId, newVisibility);
    
    if (updatedPhoto) {
      setMyPhotos(prev => 
        prev.map(photo => 
          photo.id === photoId ? { ...photo, visibility: newVisibility } : photo
        )
      );
    }
  };

  const renderPhotoGrid = (photos: Photo[]) => {
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
        <div className="gallery-grid w-full">
          {photos.map((photo) => (
            <div key={photo.id} className="fade-in">
              <PhotoCard
                id={photo.id || ''}
                imageData={photo.imageData}
                caption={photo.caption}
                visibility={photo.visibility}
                onToggleVisibility={() => handleToggleVisibility(photo.id!, photo.visibility)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'my-photos' | 'shared-photos')}>
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="my-photos">My Photos</TabsTrigger>
        <TabsTrigger value="shared-photos">Shared Photos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="my-photos">
        {renderPhotoGrid(myPhotos)}
      </TabsContent>
      
      <TabsContent value="shared-photos">
        {renderPhotoGrid(sharedPhotos)}
      </TabsContent>
    </Tabs>
  );
};

export default PhotoGallery;
