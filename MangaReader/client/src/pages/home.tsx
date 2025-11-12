import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Languages, Library, Sparkles, Upload, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative flex h-[600px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Translation Technology</span>
          </div>
          
          <h1 className="mb-6 font-heading text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Your Gateway to
            <br />
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Boundless Manga Worlds
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Read, translate, and manage your manga collection with cutting-edge AI.
            Support for multiple languages and formats, beautiful reading experience.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild data-testid="button-get-started">
              <Link href="/library">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-upload">
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Manga
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">
            Powerful Features
          </h2>
          <p className="text-muted-foreground">
            Everything you need for an exceptional manga experience
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Translate manga into 10+ languages with advanced OCR and context-aware AI,
                preserving the original emotion and style.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <BookOpen className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle>Immersive Reader</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Single and dual-page modes, pinch zoom, bookmarks, and progress tracking.
                Beautiful fullscreen reading experience.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <Library className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle>Smart Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize with favorites, custom playlists, advanced search and filtering.
                Support for images, PDFs, and ZIP archives.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                <Upload className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle>Multi-Format Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload manga in multiple formats: individual images, PDF files, or ZIP archives.
                Automatic processing and optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10">
                <Zap className="h-6 w-6 text-chart-5" />
              </div>
              <CardTitle>Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Export translated manga as high-quality PDFs or ZIP archives.
                Share your favorite series with friends.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dark and light themes, reading preferences, image quality settings.
                Tailor the experience to your needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold">
            Ready to Start Your Manga Journey?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Upload your first manga and experience the power of AI translation
          </p>
          <Button size="lg" asChild data-testid="button-cta-upload">
            <Link href="/upload">
              <Upload className="mr-2 h-5 w-5" />
              Upload Your First Manga
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
