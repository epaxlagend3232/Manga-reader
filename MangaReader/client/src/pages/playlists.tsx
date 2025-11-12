import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { List, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Playlist } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Playlists() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { toast } = useToast();

  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      apiRequest("POST", "/api/playlists", { name, mangaIds: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setIsCreateOpen(false);
      setNewPlaylistName("");
      toast({
        title: "Playlist created",
        description: "Your new playlist has been created successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/playlists/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist deleted",
        description: "The playlist has been removed",
      });
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a playlist name",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newPlaylistName);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-heading text-4xl font-bold" data-testid="text-page-title">
            <List className="mr-3 inline-block h-8 w-8" />
            Playlists
          </h1>
          <p className="text-muted-foreground">
            Organize your manga into custom collections
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-playlist">
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Give your playlist a name to start organizing your manga
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Currently Reading, Action Favorites"
                  data-testid="input-playlist-name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={createMutation.isPending}
                data-testid="button-submit-playlist"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !playlists || playlists.length === 0 ? (
        <EmptyState
          icon={List}
          title="No playlists yet"
          description="Create playlists to organize your manga into custom collections like 'Currently Reading' or 'Favorites'"
          actionLabel="Create First Playlist"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="playlists-grid">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="hover-elevate transition-all"
              data-testid={`card-playlist-${playlist.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {playlist.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteMutation.mutate(playlist.id)}
                  data-testid={`button-delete-playlist-${playlist.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {playlist.mangaIds?.length || 0} manga
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
