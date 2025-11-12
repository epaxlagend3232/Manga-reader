import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaCard } from "@/components/MangaCard";
import { EmptyState } from "@/components/EmptyState";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Manga } from "@shared/schema";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Favorites() {
  const [, setLocation] = useLocation();

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

  const favoriteMangas = mangas.filter((manga) => manga.isFavorite);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-destructive fill-destructive" />
          <h1 className="text-3xl font-bold font-heading">Favorites</h1>
        </div>
        <p className="text-muted-foreground">Your favorite manga collection</p>
      </div>

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

      {!isLoading && favoriteMangas.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Mark manga as favorites to see them here. Click the heart icon on any manga card."
          actionLabel="Browse Library"
          onAction={() => setLocation("/library")}
        />
      )}

      {!isLoading && favoriteMangas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {favoriteMangas.map((manga) => (
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
