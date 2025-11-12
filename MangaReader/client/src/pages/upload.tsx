import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, FileImage, FileArchive, File, Loader2, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/mangas/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mangas"] });
      toast({
        title: "Upload successful",
        description: "Your manga has been uploaded successfully",
      });
      setLocation("/library");
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload manga",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your manga",
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FileImage;
    if (file.type === "application/pdf") return File;
    if (file.type.includes("zip")) return FileArchive;
    return File;
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
          <UploadIcon className="mr-3 inline-block h-8 w-8" />
          Upload Manga
        </h1>
        <p className="text-muted-foreground">
          Add manga to your library from images, PDFs, or ZIP archives
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Upload images (JPG, PNG), PDFs, or ZIP archives containing manga pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="dropzone-upload"
            >
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.zip"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                data-testid="input-file-upload"
              />
              <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, PDF, and ZIP formats
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-2">
                  {files.map((file, index) => {
                    const Icon = getFileIcon(file);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-muted p-2"
                        data-testid={`file-item-${index}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                          data-testid={`button-remove-file-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manga Details</CardTitle>
            <CardDescription>
              Provide information about your manga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter manga title"
                required
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                data-testid="input-author"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g., Action, Romance, Fantasy"
                data-testid="input-genre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description or synopsis"
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/library")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={uploadMutation.isPending || files.length === 0 || !title.trim()}
            data-testid="button-submit-upload"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Manga
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
