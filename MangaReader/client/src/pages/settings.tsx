import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings as SettingsIcon, Moon, Sun, Image, Book } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReadingMode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [imageQuality, setImageQuality] = useState(80);
  const [readingMode, setReadingMode] = useState<ReadingMode>("single");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    localStorage.setItem("manga-image-quality", imageQuality.toString());
    localStorage.setItem("manga-reading-mode", readingMode);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
          <SettingsIcon className="mr-3 inline-block h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your manga reading experience
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how MangaForge looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Reading Preferences
            </CardTitle>
            <CardDescription>
              Configure your default reading settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reading-mode">Default Reading Mode</Label>
              <Select value={readingMode} onValueChange={(value: ReadingMode) => setReadingMode(value)}>
                <SelectTrigger id="reading-mode" data-testid="select-reading-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="dual">Dual Page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how pages are displayed in the reader
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Quality
            </CardTitle>
            <CardDescription>
              Adjust image quality and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality-slider">Image Quality</Label>
                <span className="text-sm text-muted-foreground" data-testid="text-quality-value">
                  {imageQuality}%
                </span>
              </div>
              <Slider
                id="quality-slider"
                value={[imageQuality]}
                onValueChange={(values) => setImageQuality(values[0])}
                min={50}
                max={100}
                step={10}
                data-testid="slider-image-quality"
              />
              <p className="text-sm text-muted-foreground">
                Higher quality requires more storage and bandwidth
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
