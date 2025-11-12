import { BookOpen, Heart, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Manga } from "@shared/schema";
import { useLocation } from "wouter";

interface MangaCardProps {
  manga: Manga;
  progress?: number;
  onToggleFavorite?: () => void;
}

export function MangaCard({ manga, progress = 0, onToggleFavorite }: MangaCardProps) {
  const [, setLocation] = useLocation();

  const handleRead = () => {
    setLocation(`/reader/${manga.id}`);
  };

  const handleTranslate = () => {
    setLocation(`/translator?mangaId=${manga.id}`);
  };

  return (
    <Card
      className="group relative overflow-hidden hover-elevate transition-all duration-200"
      data-testid={`card-manga-${manga.id}`}
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] relative bg-muted">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Hover Overlay with Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-end p-4 gap-2">
          <Button
            size="sm"
            onClick={handleRead}
            data-testid={`button-read-${manga.id}`}
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Read
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleTranslate}
            data-testid={`button-translate-${manga.id}`}
            className="w-full"
          >
            <Languages className="h-4 w-4 mr-2" />
            Translate
          </Button>
        </div>

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          data-testid={`button-favorite-${manga.id}`}
        >
          <Heart
            className={`h-4 w-4 ${manga.isFavorite ? "fill-destructive text-destructive" : "text-white"}`}
          />
        </Button>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <Progress value={progress} className="h-full rounded-none" />
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 space-y-2">
        <h3
          className="font-semibold line-clamp-2 text-base"
          data-testid={`text-title-${manga.id}`}
        >
          {manga.title}
        </h3>
        {manga.author && (
          <p className="text-sm text-muted-foreground line-clamp-1">{manga.author}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {manga.genre && (
            <Badge variant="secondary" className="text-xs">
              {manga.genre}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {manga.totalPages} pages
          </Badge>
        </div>
      </div>
    </Card>
  );
}
