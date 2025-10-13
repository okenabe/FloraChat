import { PhotoUpload } from "../PhotoUpload";

export default function PhotoUploadExample() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <PhotoUpload onPhotoSelect={(file) => console.log("Photo selected:", file.name)} />
    </div>
  );
}
