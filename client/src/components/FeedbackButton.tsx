import { useState } from "react";
import { MessageCircle, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/userContext";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your feedback message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("userId", user?.id || "");
      formData.append("pageUrl", window.location.href);
      
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

      setMessage("");
      setFiles([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        data-testid="button-feedback"
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Share your thoughts or report an issue. Screenshots are welcome!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                data-testid="input-feedback-message"
                placeholder="Tell us what you think or describe the issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-images">
                Screenshots (optional, max 5)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("feedback-images")?.click()}
                  disabled={isSubmitting || files.length >= 5}
                  data-testid="button-upload-screenshots"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add Images
                </Button>
                <span className="text-sm text-muted-foreground">
                  {files.length}/5
                </span>
              </div>
              <input
                id="feedback-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting || files.length >= 5}
              />

              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                      data-testid={`file-preview-${index}`}
                    >
                      <span className="text-sm truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                data-testid="button-cancel-feedback"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                data-testid="button-submit-feedback"
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
