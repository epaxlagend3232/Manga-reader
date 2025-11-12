import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const [localTheme, setLocalTheme] = useState<"light" | "dark">(theme);
  const [readingMode, setReadingMode] = useState<"single" | "dual">("single");
  const [imageQuality, setImageQuality] = useState(100);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings) {
      setLocalTheme(settings.theme as "light" | "dark");
      setReadingMode(settings.defaultReadingMode as "single" | "dual");
      setImageQuality(settings.imageQuality);
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { theme: string; defaultReadingMode: string; imageQuality: number }) => {
      return await apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setTheme(localTheme);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate({
      theme: localTheme,
      defaultReadingMode: readingMode,
      imageQuality,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-heading">Settings</h1>
        </div>
        <p className="text-muted-foreground">Customize your manga reading experience</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={localTheme === "dark"}
              onCheckedChange={(checked) => setLocalTheme(checked ? "dark" : "light")}
              data-testid="switch-dark-mode"
            />
          </div>
        </Card>

        {/* Reading Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Reading Preferences</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reading-mode" className="mb-2 block">
                Default Reading Mode
              </Label>
              <Select value={readingMode} onValueChange={(value: "single" | "dual") => setReadingMode(value)}>
                <SelectTrigger id="reading-mode" data-testid="select-reading-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="dual">Dual Page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Choose how manga pages are displayed in the reader
              </p>
            </div>
          </div>
        </Card>

        {/* Image Quality */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Image Quality</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Quality: {imageQuality}%</Label>
                <span className="text-sm text-muted-foreground">
                  {imageQuality >= 90 ? "High" : imageQuality >= 70 ? "Medium" : "Low"}
                </span>
              </div>
              <Slider
                value={[imageQuality]}
                onValueChange={([value]) => setImageQuality(value)}
                min={50}
                max={100}
                step={10}
                data-testid="slider-quality"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Higher quality uses more storage and bandwidth
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/library")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            data-testid="button-save"
          >
            {saveSettingsMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
