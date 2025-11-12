import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mangas = pgTable("mangas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author"),
  coverUrl: text("cover_url"),
  genre: text("genre"),
  tags: text("tags").array(),
  description: text("description"),
  totalPages: integer("total_pages").notNull().default(0),
  fileType: text("file_type").notNull(), // 'images', 'pdf', 'zip'
  files: jsonb("files").notNull().$type<string[]>(), // array of page paths/urls
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isFavorite: text("is_favorite").notNull().default("false"),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mangaIds: text("manga_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mangaId: varchar("manga_id").notNull(),
  currentPage: integer("current_page").notNull().default(0),
  bookmarks: integer("bookmarks").array().notNull().default(sql`ARRAY[]::integer[]`),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
});

export const translations = pgTable("translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mangaId: varchar("manga_id").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedPages: jsonb("translated_pages").notNull().$type<Record<number, string>>(), // page number -> translated image url
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertMangaSchema = createInsertSchema(mangas).omit({
  id: true,
  uploadedAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
  lastReadAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertManga = z.infer<typeof insertMangaSchema>;
export type Manga = typeof mangas.$inferSelect;

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Additional types for client-side use
export type ReadingMode = "single" | "dual";
export type ViewMode = "grid" | "list";
export type Theme = "light" | "dark";

export interface AppSettings {
  theme: Theme;
  readingMode: ReadingMode;
  viewMode: ViewMode;
  imageQuality: number; // 1-100
}

export const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
] as const;
