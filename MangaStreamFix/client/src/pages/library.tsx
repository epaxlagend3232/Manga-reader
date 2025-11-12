import { useState } from "react";
import { Search, Grid, List as ListIcon, Upload, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MangaCard } from "@/components/MangaCard";
import { EmptyState } from "@/components/EmptyState";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Manga } from "@shared/schema";
import { useLocation } from "wouter";

export default function Library() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: mangas = [], isLoading } = useQuery<Manga[]>({
    queryKey: ["/api/manga"],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/manga/${id}/favorite`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manga"] });
    },
  });

  const filteredMangas = mangas
    .filter((manga) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        manga.title.toLowerCase().includes(query) ||
        manga.author?.toLowerCase().includes(query) ||
        manga.genre?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 font-heading">Library</h1>
        <p className="text-muted-foreground">Your manga collection</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
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
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => setLocation("/upload")} data-testid="button-upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMangas.length === 0 && !searchQuery && (
        <EmptyState
          icon={BookOpen}
          title="No manga yet"
          description="Start building your collection by uploading your first manga"
          actionLabel="Upload Manga"
          onAction={() => setLocation("/upload")}
        />
      )}

      {/* Search Empty State */}
      {!isLoading && filteredMangas.length === 0 && searchQuery && (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No manga matching "${searchQuery}"`}
        />
      )}

      {/* Manga Grid */}
      {!isLoading && filteredMangas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredMangas.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onToggleFavorite={() => toggleFavoriteMutation.mutate(manga.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
