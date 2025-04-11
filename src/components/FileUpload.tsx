
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    onFileUpload(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-md p-6 transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
        fileName ? "bg-green-50 border-green-200" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center">
        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-green-100 p-2">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">{fileName}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={handleButtonClick}
            >
              Choose Another File
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold">Upload a photo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop an image or click to browse
            </p>
            <Button
              variant="secondary"
              className="mt-4 flex items-center gap-2"
              onClick={handleButtonClick}
            >
              <FileUp className="h-4 w-4" />
              <span>Browse Files</span>
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default FileUpload;
