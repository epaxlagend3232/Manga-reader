import { BookOpen, Languages, Library, Upload, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

const features = [
  {
    icon: Languages,
    title: "AI Translation",
    description: "Advanced OCR and context-aware translation preserving emotional nuances",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: BookOpen,
    title: "Immersive Reader",
    description: "Single/dual page modes, zoom controls, bookmarks, and progress tracking",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    icon: Library,
    title: "Smart Library",
    description: "Organize with favorites, playlists, and powerful search functionality",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Layers,
    title: "Multi-Format Support",
    description: "Import images, PDFs, and ZIP archives seamlessly",
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    icon: Upload,
    title: "Export & Share",
    description: "Download translated manga in PDF or ZIP format",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: Settings,
    title: "Customization",
    description: "Personalize themes, reading preferences, and quality settings",
    color: "bg-fuchsia-500/10 text-fuchsia-500",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background py-20 md:py-32">
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <Badge className="mb-6" data-testid="badge-feature">
            AI-Powered Translation Technology
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading">
            Your Gateway to{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Boundless Manga Worlds
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Read, translate, and manage your manga collection with cutting-edge AI technology.
            Experience manga like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/library")}
              data-testid="button-start-reading"
            >
              Start Reading
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/upload")}
              data-testid="button-upload-manga"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Manga
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for the ultimate manga reading experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover-elevate transition-all duration-200 cursor-default"
              data-testid={`card-feature-${index}`}
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-heading">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 font-heading">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your first manga and experience the future of manga reading
          </p>
          <Button size="lg" onClick={() => setLocation("/upload")} data-testid="button-cta-upload">
            <Upload className="h-5 w-5 mr-2" />
            Upload Your First Manga
          </Button>
        </div>
      </section>
    </div>
  );
}
