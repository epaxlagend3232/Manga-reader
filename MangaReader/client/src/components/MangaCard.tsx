import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Languages } from "lucide-react";
import type { Manga } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";

interface MangaCardProps {
  manga: Manga;
  onToggleFavorite?: (id: string) => void;
}

export function MangaCard({ manga, onToggleFavorite }: MangaCardProps) {
  const [imageError, setImageError] = useState(false);

  const progressPercent = manga.totalPages > 0 ? 0 : 0;

  return (
    <Card
      className="group relative overflow-hidden hover-elevate transition-all"
      data-testid={`card-manga-${manga.id}`}
    >
      <Link href={`/reader/${manga.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {manga.coverUrl && !imageError ? (
            <img
              src={`/uploads/${manga.coverUrl}`}
              alt={manga.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 backdrop-blur-sm"
                asChild
                data-testid={`button-read-${manga.id}`}
              >
                <Link href={`/reader/${manga.id}`}>
                  <BookOpen className="mr-1 h-3 w-3" />
                  Read
                </Link>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="backdrop-blur-sm"
                asChild
                data-testid={`button-translate-${manga.id}`}
              >
                <Link href={`/translator/${manga.id}`}>
                  <Languages className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3
            className="line-clamp-2 text-sm font-semibold leading-tight"
            data-testid={`text-manga-title-${manga.id}`}
          >
            {manga.title}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(manga.id);
            }}
            data-testid={`button-favorite-${manga.id}`}
          >
            <Heart
              className={`h-4 w-4 ${
                manga.isFavorite === "true"
                  ? "fill-destructive text-destructive"
                  : ""
              }`}
            />
          </Button>
        </div>

        {manga.author && (
          <p className="mb-2 text-xs text-muted-foreground">{manga.author}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {manga.genre && (
            <Badge variant="secondary" className="text-xs">
              {manga.genre}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {manga.totalPages} pages
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
