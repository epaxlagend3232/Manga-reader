import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Bookmark,
  Settings,
  Maximize,
  Minimize,
} from "lucide-react";
import type { Manga, ReadingProgress, ReadingMode } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [readingMode, setReadingMode] = useState<ReadingMode>("single");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const { toast } = useToast();

  const { data: manga, isLoading } = useQuery<Manga>({
    queryKey: ["/api/mangas", id],
  });

  const { data: progress } = useQuery<ReadingProgress>({
    queryKey: ["/api/progress", id],
  });

  useEffect(() => {
    if (progress) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress]);

  const updateProgress = useMutation({
    mutationFn: (page: number) =>
      apiRequest("POST", `/api/progress/${id}`, { currentPage: page }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
    },
  });

  const toggleBookmark = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/progress/${id}/bookmark`, { page: currentPage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", id] });
      toast({ title: "Bookmark toggled" });
    },
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFullscreen) {
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isFullscreen, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (!manga) return;
    if (newPage < 0 || newPage >= manga.totalPages) return;
    setCurrentPage(newPage);
    updateProgress.mutate(newPage);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const isBookmarked = progress?.bookmarks?.includes(currentPage) || false;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Manga not found</p>
      </div>
    );
  }

  const pages = manga.files || [];
  const displayPages =
    readingMode === "dual" && currentPage < pages.length - 1
      ? [pages[currentPage], pages[currentPage + 1]]
      : [pages[currentPage]];

  return (
    <div
      className="relative h-screen bg-black"
      onMouseMove={() => setControlsVisible(true)}
      data-testid="reader-container"
    >
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          onClick={() => setLocation("/library")}
          data-testid="button-close-reader"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-black/70 p-3 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="text-white hover:bg-white/20"
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span className="px-4 text-sm text-white" data-testid="text-page-counter">
            {currentPage + 1} / {manga.totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= manga.totalPages - 1}
            className="text-white hover:bg-white/20"
            data-testid="button-next-page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleBookmark.mutate()}
            className={`backdrop-blur-sm ${
              isBookmarked
                ? "bg-primary text-primary-foreground"
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
            data-testid="button-bookmark"
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            data-testid="button-fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                data-testid="button-reader-settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Reading Mode</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setReadingMode("single")}
                data-testid="menu-single-page"
              >
                Single Page {readingMode === "single" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReadingMode("dual")}
                data-testid="menu-dual-page"
              >
                Dual Page {readingMode === "dual" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Zoom</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="mr-2 h-4 w-4" />
                Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="mr-2 h-4 w-4" />
                Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(100)}>
                Reset Zoom ({zoom}%)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex h-full items-center justify-center gap-4 p-4">
        {displayPages.map((pageUrl, idx) => (
          <img
            key={idx}
            src={`/uploads/${pageUrl}`}
            alt={`Page ${currentPage + idx + 1}`}
            className="max-h-full object-contain"
            style={{ transform: `scale(${zoom / 100})` }}
            data-testid={`image-page-${currentPage + idx}`}
          />
        ))}
      </div>
    </div>
  );
}
