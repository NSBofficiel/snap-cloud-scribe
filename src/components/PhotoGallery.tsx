
import React from "react";
import PhotoCard from "./PhotoCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon } from "lucide-react";

export interface Photo {
  id: string;
  imageData: string;
  caption: string;
  uploaded: boolean;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onUpdatePhoto: (id: string, caption: string) => void;
  onDeletePhoto: (id: string) => void;
  onUploadPhoto: (id: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onUpdatePhoto,
  onDeletePhoto,
  onUploadPhoto,
}) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 border border-dashed rounded-md">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="font-medium mb-1">No photos yet</h3>
        <p className="text-sm text-muted-foreground text-center">
          Capture photos using the camera above to see them here.
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
              id={photo.id}
              imageData={photo.imageData}
              caption={photo.caption}
              uploaded={photo.uploaded}
              onUpdate={onUpdatePhoto}
              onDelete={onDeletePhoto}
              onUpload={onUploadPhoto}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PhotoGallery;
