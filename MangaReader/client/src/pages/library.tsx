import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MangaCard } from "@/components/MangaCard";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, Grid3x3, List, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Manga, ViewMode } from "@shared/schema";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("recent");
  const { toast } = useToast();

  const { data: mangas, isLoading } = useQuery<Manga[]>({
    queryKey: ["/api/mangas"],
  });

  const handleToggleFavorite = async (id: string) => {
    try {
      await apiRequest("PATCH", `/api/mangas/${id}/favorite`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/mangas"] });
      toast({
        title: "Updated",
        description: "Favorite status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const filteredMangas = mangas?.filter((manga) =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedMangas = filteredMangas?.sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
          Library
        </h1>
        <p className="text-muted-foreground">
          Your complete manga collection
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button asChild data-testid="button-upload-nav">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !sortedMangas || sortedMangas.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No manga in your library"
          description="Upload your first manga to start building your collection"
          actionLabel="Upload Manga"
          onAction={() => window.location.href = "/upload"}
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              : "space-y-4"
          }
          data-testid="manga-list"
        >
          {sortedMangas.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
