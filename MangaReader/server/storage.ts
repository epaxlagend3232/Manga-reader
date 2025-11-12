import {
  type Manga,
  type InsertManga,
  type Playlist,
  type InsertPlaylist,
  type ReadingProgress,
  type InsertReadingProgress,
  type Translation,
  type InsertTranslation,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMangas(): Promise<Manga[]>;
  getManga(id: string): Promise<Manga | undefined>;
  createManga(manga: InsertManga): Promise<Manga>;
  updateManga(id: string, updates: Partial<Manga>): Promise<Manga | undefined>;
  deleteManga(id: string): Promise<boolean>;
  toggleFavorite(id: string): Promise<Manga | undefined>;

  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;

  getReadingProgress(mangaId: string): Promise<ReadingProgress | undefined>;
  updateReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
  toggleBookmark(mangaId: string, page: number): Promise<ReadingProgress>;

  getTranslations(mangaId?: string): Promise<Translation[]>;
  getTranslation(id: string): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: string, updates: Partial<Translation>): Promise<Translation | undefined>;
}

export class MemStorage implements IStorage {
  private mangas: Map<string, Manga>;
  private playlists: Map<string, Playlist>;
  private readingProgress: Map<string, ReadingProgress>;
  private translations: Map<string, Translation>;

  constructor() {
    this.mangas = new Map();
    this.playlists = new Map();
    this.readingProgress = new Map();
    this.translations = new Map();
  }

  async getMangas(): Promise<Manga[]> {
    return Array.from(this.mangas.values());
  }

  async getManga(id: string): Promise<Manga | undefined> {
    return this.mangas.get(id);
  }

  async createManga(insertManga: InsertManga): Promise<Manga> {
    const id = randomUUID();
    const manga: Manga = {
      ...insertManga,
      id,
      uploadedAt: new Date(),
    };
    this.mangas.set(id, manga);
    return manga;
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<Manga | undefined> {
    const manga = this.mangas.get(id);
    if (!manga) return undefined;

    const updated = { ...manga, ...updates };
    this.mangas.set(id, updated);
    return updated;
  }

  async deleteManga(id: string): Promise<boolean> {
    return this.mangas.delete(id);
  }

  async toggleFavorite(id: string): Promise<Manga | undefined> {
    const manga = this.mangas.get(id);
    if (!manga) return undefined;

    const updated = {
      ...manga,
      isFavorite: manga.isFavorite === "true" ? "false" : "true",
    };
    this.mangas.set(id, updated);
    return updated;
  }

  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = {
      ...insertPlaylist,
      id,
      createdAt: new Date(),
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;

    const updated = { ...playlist, ...updates };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    return this.playlists.delete(id);
  }

  async getReadingProgress(mangaId: string): Promise<ReadingProgress | undefined> {
    return this.readingProgress.get(mangaId);
  }

  async updateReadingProgress(insertProgress: InsertReadingProgress): Promise<ReadingProgress> {
    const existing = this.readingProgress.get(insertProgress.mangaId);
    
    const progress: ReadingProgress = {
      id: existing?.id || randomUUID(),
      ...insertProgress,
      lastReadAt: new Date(),
    };

    this.readingProgress.set(insertProgress.mangaId, progress);
    return progress;
  }

  async toggleBookmark(mangaId: string, page: number): Promise<ReadingProgress> {
    let progress = this.readingProgress.get(mangaId);
    
    if (!progress) {
      progress = {
        id: randomUUID(),
        mangaId,
        currentPage: 0,
        bookmarks: [],
        lastReadAt: new Date(),
      };
    }

    const bookmarks = progress.bookmarks || [];
    const index = bookmarks.indexOf(page);
    
    const updatedBookmarks = index >= 0
      ? bookmarks.filter((p) => p !== page)
      : [...bookmarks, page];

    const updated = {
      ...progress,
      bookmarks: updatedBookmarks,
      lastReadAt: new Date(),
    };

    this.readingProgress.set(mangaId, updated);
    return updated;
  }

  async getTranslations(mangaId?: string): Promise<Translation[]> {
    const all = Array.from(this.translations.values());
    if (mangaId) {
      return all.filter((t) => t.mangaId === mangaId);
    }
    return all;
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    return this.translations.get(id);
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = randomUUID();
    const translation: Translation = {
      ...insertTranslation,
      id,
      createdAt: new Date(),
    };
    this.translations.set(id, translation);
    return translation;
  }

  async updateTranslation(id: string, updates: Partial<Translation>): Promise<Translation | undefined> {
    const translation = this.translations.get(id);
    if (!translation) return undefined;

    const updated = { ...translation, ...updates };
    this.translations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
