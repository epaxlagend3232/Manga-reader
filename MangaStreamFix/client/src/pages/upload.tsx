import { useState, useRef } from "react";
import { Upload as UploadIcon, X, Image, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/manga/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manga"] });
      toast({
        title: "Success!",
        description: "Manga uploaded successfully",
      });
      setLocation("/library");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload manga",
        variant: "destructive",
      });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <Image className="h-4 w-4" />;
    }
    if (ext === "pdf") {
      return <FileText className="h-4 w-4" />;
    }
    if (ext === "zip") {
      return <Archive className="h-4 w-4" />;
    }
    return <UploadIcon className="h-4 w-4" />;
  };

  const handleUpload = () => {
    if (!files.length || !title) {
      toast({
        title: "Missing information",
        description: "Please add files and enter a title",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("description", description);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-heading">Upload Manga</h1>
        <p className="text-muted-foreground">Add a new manga to your collection</p>
      </div>

      <div className="space-y-8">
        {/* File Upload Area */}
        <Card>
          <div
            className={`p-12 border-2 border-dashed rounded-lg text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            data-testid="dropzone-upload"
          >
            <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: JPG, PNG, PDF, ZIP (Max 50MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-files"
            />
            <Button onClick={() => fileInputRef.current?.click()} data-testid="button-browse">
              Browse Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-medium mb-3">Selected Files ({files.length})</h4>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted rounded-md"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex-shrink-0">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Manga Details Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Manga Details</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter manga title"
                data-testid="input-title"
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                data-testid="input-author"
              />
            </div>

            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g., Action, Romance, Mystery"
                data-testid="input-genre"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the manga"
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/library")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!files.length || !title || uploadMutation.isPending}
            data-testid="button-upload"
          >
            {uploadMutation.isPending && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {uploadMutation.isPending ? "Uploading..." : "Upload Manga"}
          </Button>
        </div>
      </div>
    </div>
  );
}
