import { useState } from "react";
import { Languages, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Manga, Translation } from "@shared/schema";
import { SUPPORTED_LANGUAGES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { EmptyState } from "@/components/EmptyState";

export default function TranslatorPage() {
  const { toast } = useToast();
  const [selectedMangaId, setSelectedMangaId] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState("ja");
  const [targetLanguage, setTargetLanguage] = useState("en");

  const { data: mangas = [] } = useQuery<Manga[]>({
    queryKey: ["/api/manga"],
  });

  const { data: translations = [] } = useQuery<Translation[]>({
    queryKey: ["/api/translations"],
  });

  const createTranslationMutation = useMutation({
    mutationFn: async (data: { mangaId: string; sourceLanguage: string; targetLanguage: string }) => {
      return await apiRequest("POST", "/api/translations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({
        title: "Translation Started",
        description: "Your manga is being translated. This may take a few minutes.",
      });
    },
  });

  const selectedManga = mangas.find((m) => m.id === selectedMangaId);

  const handleStartTranslation = () => {
    if (!selectedMangaId || !sourceLanguage || !targetLanguage) {
      toast({
        title: "Missing information",
        description: "Please select a manga and languages",
        variant: "destructive",
      });
      return;
    }

    createTranslationMutation.mutate({
      mangaId: selectedMangaId,
      sourceLanguage,
      targetLanguage,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-heading">Translator</h1>
        </div>
        <p className="text-muted-foreground">AI-powered manga translation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Translation Controls (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Manga Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Manga</h3>
            <Select value={selectedMangaId} onValueChange={setSelectedMangaId}>
              <SelectTrigger data-testid="select-manga">
                <SelectValue placeholder="Choose a manga" />
              </SelectTrigger>
              <SelectContent>
                {mangas.map((manga) => (
                  <SelectItem key={manga.id} value={manga.id}>
                    {manga.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedManga && (
              <div className="mt-4 flex gap-4">
                <div className="w-24 h-36 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {selectedManga.coverUrl ? (
                    <img
                      src={selectedManga.coverUrl}
                      alt={selectedManga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Languages className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{selectedManga.title}</h4>
                  {selectedManga.author && (
                    <p className="text-sm text-muted-foreground mb-2">{selectedManga.author}</p>
                  )}
                  <Badge variant="outline">{selectedManga.totalPages} pages</Badge>
                </div>
              </div>
            )}
          </Card>

          {/* Language Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Translation Settings</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Source Language</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger data-testid="select-source-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Language</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger data-testid="select-target-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">Translate All</TabsTrigger>
                <TabsTrigger value="select">Select Pages</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="text-sm text-muted-foreground pt-4">
                Translate all pages in the manga
              </TabsContent>
              <TabsContent value="select" className="text-sm text-muted-foreground pt-4">
                Select specific pages to translate (coming soon)
              </TabsContent>
            </Tabs>

            <Button
              className="w-full"
              onClick={handleStartTranslation}
              disabled={!selectedMangaId || createTranslationMutation.isPending}
              data-testid="button-start-translation"
            >
              {createTranslationMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Starting Translation...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Start Translation
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Right: Translation History (40%) */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Translation History</h3>

            {translations.length === 0 ? (
              <EmptyState
                icon={Languages}
                title="No translations yet"
                description="Start translating manga to see your history here"
              />
            ) : (
              <div className="space-y-4">
                {translations.map((translation) => {
                  const manga = mangas.find((m) => m.id === translation.mangaId);
                  const sourceLang = SUPPORTED_LANGUAGES.find((l) => l.code === translation.sourceLanguage);
                  const targetLang = SUPPORTED_LANGUAGES.find((l) => l.code === translation.targetLanguage);

                  return (
                    <div
                      key={translation.id}
                      className="p-4 border rounded-lg hover-elevate transition-all"
                      data-testid={`translation-${translation.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{manga?.title || "Unknown"}</h4>
                          <p className="text-xs text-muted-foreground">
                            {sourceLang?.flag} {sourceLang?.name} → {targetLang?.flag} {targetLang?.name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(translation.status)} variant="outline">
                          {translation.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        {formatDistance(new Date(translation.createdAt), new Date(), { addSuffix: true })}
                      </div>

                      {translation.status === "completed" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      )}

                      {translation.status === "processing" && (
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full w-1/2 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
