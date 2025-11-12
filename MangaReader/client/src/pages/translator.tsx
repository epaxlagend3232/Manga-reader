import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Languages, Loader2, Download, Eye } from "lucide-react";
import type { Manga, Translation } from "@shared/schema";
import { languages } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Translator() {
  const { id } = useParams<{ id?: string }>();
  const [sourceLanguage, setSourceLanguage] = useState("ja");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: manga } = useQuery<Manga>({
    queryKey: ["/api/mangas", id],
    enabled: !!id,
  });

  const { data: translations } = useQuery<Translation[]>({
    queryKey: ["/api/translations", id],
    enabled: !!id,
  });

  const translateMutation = useMutation({
    mutationFn: (data: {
      mangaId: string;
      sourceLanguage: string;
      targetLanguage: string;
      pages?: number[];
    }) => apiRequest("POST", "/api/translate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({
        title: "Translation started",
        description: "Your manga translation is being processed",
      });
    },
    onError: () => {
      toast({
        title: "Translation failed",
        description: "Failed to start translation",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (translationId: string) =>
      apiRequest("POST", `/api/translations/${translationId}/export`, {}),
    onSuccess: (data: { url: string }) => {
      window.open(data.url, "_blank");
      toast({
        title: "Export successful",
        description: "Your translated manga is ready to download",
      });
    },
  });

  const handleTranslate = () => {
    if (!id) return;

    translateMutation.mutate({
      mangaId: id,
      sourceLanguage,
      targetLanguage,
      pages: selectedPages.length > 0 ? selectedPages : undefined,
    });
  };

  const getActiveTranslation = translations?.find(
    (t) => t.status === "processing" || t.status === "completed"
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
          <Languages className="mr-3 inline-block h-8 w-8" />
          Translator
        </h1>
        <p className="text-muted-foreground">
          Translate manga using AI-powered OCR and natural language processing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {manga && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Manga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {manga.coverUrl && (
                      <img
                        src={`/uploads/${manga.coverUrl}`}
                        alt={manga.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold" data-testid="text-manga-title">
                      {manga.title}
                    </h3>
                    {manga.author && (
                      <p className="mb-2 text-sm text-muted-foreground">{manga.author}</p>
                    )}
                    <Badge>{manga.totalPages} pages</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Translation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Language</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger data-testid="select-source-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Language</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger data-testid="select-target-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" data-testid="tab-translate-all">
                    Translate All
                  </TabsTrigger>
                  <TabsTrigger value="select" data-testid="tab-translate-select">
                    Select Pages
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    All {manga?.totalPages || 0} pages will be translated
                  </p>
                </TabsContent>
                <TabsContent value="select" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Select specific pages to translate (coming soon)
                  </p>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleTranslate}
                disabled={!id || translateMutation.isPending}
                className="w-full"
                data-testid="button-start-translation"
              >
                {translateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Translation...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Start Translation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Translation History</CardTitle>
            </CardHeader>
            <CardContent>
              {!translations || translations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No translations yet. Start your first translation to see results here.
                </p>
              ) : (
                <div className="space-y-4">
                  {translations.map((translation) => (
                    <div
                      key={translation.id}
                      className="rounded-lg border p-4"
                      data-testid={`translation-${translation.id}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {
                            languages.find((l) => l.code === translation.sourceLanguage)
                              ?.flag
                          }{" "}
                          →{" "}
                          {
                            languages.find((l) => l.code === translation.targetLanguage)
                              ?.flag
                          }
                        </div>
                        <Badge
                          variant={
                            translation.status === "completed"
                              ? "default"
                              : translation.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {translation.status}
                        </Badge>
                      </div>

                      {translation.status === "processing" && (
                        <Progress value={50} className="mb-2" />
                      )}

                      {translation.status === "completed" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            data-testid={`button-view-${translation.id}`}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => exportMutation.mutate(translation.id)}
                            disabled={exportMutation.isPending}
                            data-testid={`button-export-${translation.id}`}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Export
                          </Button>
                        </div>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(translation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
