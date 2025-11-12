import { useState } from "react";
import { List, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/EmptyState";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Playlist } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

export default function Playlists() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/playlists", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setIsCreateOpen(false);
      setNewPlaylistName("");
      toast({ title: "Playlist created successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/playlists/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: "Playlist deleted" });
    },
  });

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    createMutation.mutate(newPlaylistName);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <List className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-heading">Playlists</h1>
          </div>
          <p className="text-muted-foreground">Organize your manga into collections</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-playlist">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Currently Reading, Favorites"
                  data-testid="input-playlist-name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newPlaylistName.trim() || createMutation.isPending}
                data-testid="button-create"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoading && playlists.length === 0 && (
        <EmptyState
          icon={List}
          title="No playlists yet"
          description="Create playlists to organize your manga collection. Great for tracking what you're reading or grouping by genre."
          actionLabel="Create Playlist"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {!isLoading && playlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="p-6 hover-elevate transition-all duration-200"
              data-testid={`card-playlist-${playlist.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(playlist.mangaIds as string[]).length} manga
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(playlist.id)}
                  data-testid={`button-delete-${playlist.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Created {formatDistance(new Date(playlist.createdAt), new Date(), { addSuffix: true })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
