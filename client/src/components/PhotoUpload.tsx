import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onPhotoSelect: (file: File) => void;
  disabled?: boolean;
}

export function PhotoUpload({ onPhotoSelect, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        onPhotoSelect(file);
      }
    },
    [onPhotoSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden max-h-80" data-testid="preview-container">
        <img
          src={preview}
          alt="Plant preview"
          className="w-full h-full object-contain bg-muted"
          data-testid="img-preview"
        />
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2"
          onClick={clearPhoto}
          data-testid="button-clear-photo"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed p-12 text-center transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary hover:bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      data-testid="dropzone"
    >
      <input
        type="file"
        id="photo-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        disabled={disabled}
        data-testid="input-file"
      />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <Upload className="h-12 w-12 text-primary/40" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Drop photo or click to upload</p>
          <p className="text-xs text-muted-foreground">
            Upload a clear photo of your plant
          </p>
        </div>
      </div>
    </div>
  );
}
