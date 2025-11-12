// Storage implementation - referenced from javascript_database blueprint
import {
  users,
  mangas,
  playlists,
  readingProgress,
  translations,
  settings,
  type User,
  type InsertUser,
  type Manga,
  type InsertManga,
  type Playlist,
  type InsertPlaylist,
  type ReadingProgress,
  type InsertReadingProgress,
  type Translation,
  type InsertTranslation,
  type Settings,
  type InsertSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, or } from "drizzle-orm";

// Storage interface defining all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Manga operations
  getAllMangas(): Promise<Manga[]>;
  getManga(id: string): Promise<Manga | undefined>;
  createManga(manga: InsertManga): Promise<Manga>;
  updateManga(id: string, manga: Partial<InsertManga>): Promise<Manga | undefined>;
  deleteManga(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<Manga | undefined>;
  searchMangas(query: string): Promise<Manga[]>;

  // Playlist operations
  getAllPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<void>;
  addMangaToPlaylist(playlistId: string, mangaId: string): Promise<Playlist | undefined>;
  removeMangaFromPlaylist(playlistId: string, mangaId: string): Promise<Playlist | undefined>;

  // Reading progress operations
  getReadingProgress(mangaId: string): Promise<ReadingProgress | undefined>;
  saveReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
  updateReadingProgress(
    mangaId: string,
    progress: Partial<InsertReadingProgress>
  ): Promise<ReadingProgress | undefined>;

  // Translation operations
  getAllTranslations(): Promise<Translation[]>;
  getTranslation(id: string): Promise<Translation | undefined>;
  getTranslationsByManga(mangaId: string): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(
    id: string,
    translation: Partial<InsertTranslation>
  ): Promise<Translation | undefined>;
  deleteTranslation(id: string): Promise<void>;

  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  saveSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Manga operations
  async getAllMangas(): Promise<Manga[]> {
    return await db.select().from(mangas).orderBy(desc(mangas.uploadedAt));
  }

  async getManga(id: string): Promise<Manga | undefined> {
    const [manga] = await db.select().from(mangas).where(eq(mangas.id, id));
    return manga || undefined;
  }

  async createManga(insertManga: InsertManga): Promise<Manga> {
    const [manga] = await db.insert(mangas).values(insertManga).returning();
    return manga;
  }

  async updateManga(id: string, updates: Partial<InsertManga>): Promise<Manga | undefined> {
    const [manga] = await db
      .update(mangas)
      .set(updates)
      .where(eq(mangas.id, id))
      .returning();
    return manga || undefined;
  }

  async deleteManga(id: string): Promise<void> {
    await db.delete(mangas).where(eq(mangas.id, id));
  }

  async toggleFavorite(id: string): Promise<Manga | undefined> {
    const manga = await this.getManga(id);
    if (!manga) return undefined;

    const [updated] = await db
      .update(mangas)
      .set({ isFavorite: !manga.isFavorite })
      .where(eq(mangas.id, id))
      .returning();
    return updated || undefined;
  }

  async searchMangas(query: string): Promise<Manga[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(mangas)
      .where(
        or(
          like(mangas.title, searchTerm),
          like(mangas.author, searchTerm),
          like(mangas.genre, searchTerm)
        )
      )
      .orderBy(desc(mangas.uploadedAt));
  }

  // Playlist operations
  async getAllPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists).orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db.insert(playlists).values(insertPlaylist).returning();
    return playlist;
  }

  async updatePlaylist(
    id: string,
    updates: Partial<InsertPlaylist>
  ): Promise<Playlist | undefined> {
    const [playlist] = await db
      .update(playlists)
      .set(updates)
      .where(eq(playlists.id, id))
      .returning();
    return playlist || undefined;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async addMangaToPlaylist(playlistId: string, mangaId: string): Promise<Playlist | undefined> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return undefined;

    const mangaIds = playlist.mangaIds as string[];
    if (mangaIds.includes(mangaId)) return playlist;

    const [updated] = await db
      .update(playlists)
      .set({ mangaIds: [...mangaIds, mangaId] })
      .where(eq(playlists.id, playlistId))
      .returning();
    return updated || undefined;
  }

  async removeMangaFromPlaylist(
    playlistId: string,
    mangaId: string
  ): Promise<Playlist | undefined> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return undefined;

    const mangaIds = (playlist.mangaIds as string[]).filter((id) => id !== mangaId);

    const [updated] = await db
      .update(playlists)
      .set({ mangaIds })
      .where(eq(playlists.id, playlistId))
      .returning();
    return updated || undefined;
  }

  // Reading progress operations
  async getReadingProgress(mangaId: string): Promise<ReadingProgress | undefined> {
    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.mangaId, mangaId));
    return progress || undefined;
  }

  async saveReadingProgress(insertProgress: InsertReadingProgress): Promise<ReadingProgress> {
    const existing = await this.getReadingProgress(insertProgress.mangaId);

    if (existing) {
      const [updated] = await db
        .update(readingProgress)
        .set({
          currentPage: insertProgress.currentPage,
          bookmarks: insertProgress.bookmarks,
          lastReadAt: new Date(),
        })
        .where(eq(readingProgress.mangaId, insertProgress.mangaId))
        .returning();
      return updated;
    }

    const [progress] = await db.insert(readingProgress).values(insertProgress).returning();
    return progress;
  }

  async updateReadingProgress(
    mangaId: string,
    updates: Partial<InsertReadingProgress>
  ): Promise<ReadingProgress | undefined> {
    const [progress] = await db
      .update(readingProgress)
      .set({ ...updates, lastReadAt: new Date() })
      .where(eq(readingProgress.mangaId, mangaId))
      .returning();
    return progress || undefined;
  }

  // Translation operations
  async getAllTranslations(): Promise<Translation[]> {
    return await db.select().from(translations).orderBy(desc(translations.createdAt));
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.id, id));
    return translation || undefined;
  }

  async getTranslationsByManga(mangaId: string): Promise<Translation[]> {
    return await db
      .select()
      .from(translations)
      .where(eq(translations.mangaId, mangaId))
      .orderBy(desc(translations.createdAt));
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [translation] = await db.insert(translations).values(insertTranslation).returning();
    return translation;
  }

  async updateTranslation(
    id: string,
    updates: Partial<InsertTranslation>
  ): Promise<Translation | undefined> {
    const [translation] = await db
      .update(translations)
      .set(updates)
      .where(eq(translations.id, id))
      .returning();
    return translation || undefined;
  }

  async deleteTranslation(id: string): Promise<void> {
    await db.delete(translations).where(eq(translations.id, id));
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting || undefined;
  }

  async saveSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    }

    const [setting] = await db.insert(settings).values(insertSettings).returning();
    return setting;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existing = await this.getSettings();
    if (!existing) return undefined;

    const [updated] = await db
      .update(settings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
