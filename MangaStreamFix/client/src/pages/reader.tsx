import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { X, ChevronLeft, ChevronRight, Bookmark, Maximize, Settings, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Manga, ReadingProgress } from "@shared/schema";
import { useLocation } from "wouter";

export default function Reader() {
  const [, params] = useRoute("/reader/:id");
  const [, setLocation] = useLocation();
  const mangaId = params?.id;

  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [readingMode, setReadingMode] = useState<"single" | "dual">("single");
  const [showControls, setShowControls] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: manga } = useQuery<Manga>({
    queryKey: ["/api/manga", mangaId],
    enabled: !!mangaId,
  });

  const { data: progress } = useQuery<ReadingProgress | null>({
    queryKey: ["/api/progress", mangaId],
    enabled: !!mangaId,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data: { mangaId: string; currentPage: number; bookmarks: number[] }) => {
      return await apiRequest("POST", "/api/progress", data);
    },
  });

  useEffect(() => {
    if (progress) {
      setCurrentPage(progress.currentPage);
      setBookmarks(progress.bookmarks as number[]);
    }
  }, [progress]);

  useEffect(() => {
    if (!mangaId) return;

    const saveProgress = () => {
      saveProgressMutation.mutate({
        mangaId,
        currentPage,
        bookmarks,
      });
    };

    const timer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timer);
  }, [currentPage, bookmarks, mangaId]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(currentPage)
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!manga) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  const totalPages = manga.totalPages;
  const currentPagePath = (manga.files as string[])[currentPage];

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Close Button */}
      <div
        className={`absolute top-4 left-4 z-50 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          onClick={() => setLocation("/library")}
          data-testid="button-close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Top Right Controls */}
      <div
        className={`absolute top-4 right-4 z-50 flex gap-2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          onClick={toggleBookmark}
          data-testid="button-bookmark"
        >
          <Bookmark
            className={`h-5 w-5 ${bookmarks.includes(currentPage) ? "fill-white" : ""}`}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          onClick={toggleFullscreen}
          data-testid="button-fullscreen"
        >
          <Maximize className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Reading Mode</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setReadingMode("single")}>
              Single Page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReadingMode("dual")}>
              Dual Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Zoom: {zoom}%</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setZoom((z) => Math.min(200, z + 10))}>
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <ZoomOut className="h-4 w-4 mr-2" />
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Zoom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Manga Page */}
      <div className="flex items-center justify-center h-full p-4">
        {currentPagePath && (
          <img
            src={currentPagePath}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
            data-testid="image-page"
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div className="bg-black/70 backdrop-blur-md rounded-full p-2 flex items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            data-testid="button-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span className="text-white font-medium min-w-[100px] text-center" data-testid="text-page">
            {currentPage + 1} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            data-testid="button-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
