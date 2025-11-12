import { useQuery } from "@tanstack/react-query";
import { MangaCard } from "@/components/MangaCard";
import { EmptyState } from "@/components/EmptyState";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Manga } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Favorites() {
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

  const favorites = mangas?.filter((manga) => manga.isFavorite === "true");

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
          <Heart className="mr-3 inline-block h-8 w-8 fill-destructive text-destructive" />
          Favorites
        </h1>
        <p className="text-muted-foreground">
          Your favorite manga collection
        </p>
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
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Mark manga as favorites to see them here. Click the heart icon on any manga card to add it to your favorites."
          actionLabel="Browse Library"
          onAction={() => window.location.href = "/library"}
        />
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5" data-testid="favorites-list">
          {favorites.map((manga) => (
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
