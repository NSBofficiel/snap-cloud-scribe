
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Trash2, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  id: string;
  imageData: string;
  caption: string;
  uploaded: boolean;
  onUpdate: (id: string, caption: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  id,
  imageData,
  caption,
  uploaded,
  onUpdate,
  onDelete,
  onUpload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newCaption, setNewCaption] = useState(caption);

  const handleSave = () => {
    onUpdate(id, newCaption);
    setIsEditing(false);
  };

  return (
    <Card className={cn("photo-card overflow-hidden h-full", 
      !uploaded && "border-dashed border-muted-foreground/50"
    )}>
      <CardContent className="p-0">
        <img
          src={imageData}
          alt={caption || "Photo"}
          className="w-full aspect-[4/3] object-cover"
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-3">
        {isEditing ? (
          <div className="flex items-center w-full gap-2">
            <Input
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
              {caption || "No caption"}
            </p>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex justify-between w-full mt-2">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              uploaded ? "text-green-500" : "text-muted-foreground"
            )}
            onClick={() => !uploaded && onUpload(id)}
            disabled={uploaded}
          >
            {uploaded ? (
              <>
                <Cloud className="h-4 w-4" />
                <span className="text-xs">Saved</span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;
