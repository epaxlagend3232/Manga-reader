import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping existing structure)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Manga table - stores manga metadata and file information
export const mangas = pgTable("mangas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author"),
  genre: text("genre"),
  description: text("description"),
  coverUrl: text("cover_url"),
  totalPages: integer("total_pages").notNull().default(0),
  fileType: text("file_type").notNull(), // 'images', 'pdf', 'zip'
  files: jsonb("files").notNull().$type<string[]>(), // Array of file paths
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isFavorite: boolean("is_favorite").notNull().default(false),
});

// Playlists table - custom collections of manga
export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mangaIds: jsonb("manga_ids").notNull().$type<string[]>().default([]), // Array of manga IDs
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reading progress table - tracks user reading progress
export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mangaId: varchar("manga_id").notNull().references(() => mangas.id, { onDelete: "cascade" }),
  currentPage: integer("current_page").notNull().default(0),
  bookmarks: jsonb("bookmarks").notNull().$type<number[]>().default([]), // Array of page numbers
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
});

// Translations table - AI translation records
export const translations = pgTable("translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mangaId: varchar("manga_id").notNull().references(() => mangas.id, { onDelete: "cascade" }),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedPages: jsonb("translated_pages").notNull().$type<Record<number, string>>().default({}), // Map of page number to translated image path
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Settings table - user preferences
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theme: text("theme").notNull().default("light"), // 'light', 'dark'
  defaultReadingMode: text("default_reading_mode").notNull().default("single"), // 'single', 'dual'
  imageQuality: integer("image_quality").notNull().default(100), // 50-100
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const mangasRelations = relations(mangas, ({ many }) => ({
  readingProgress: many(readingProgress),
  translations: many(translations),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  manga: one(mangas, {
    fields: [readingProgress.mangaId],
    references: [mangas.id],
  }),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  manga: one(mangas, {
    fields: [translations.mangaId],
    references: [mangas.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

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
  completedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Manga = typeof mangas.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Additional TypeScript types for frontend
export type ReadingMode = "single" | "dual";
export type ViewMode = "grid" | "list";
export type Theme = "light" | "dark";
export type FileType = "images" | "pdf" | "zip";
export type TranslationStatus = "pending" | "processing" | "completed" | "failed";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
] as const;

export interface AppSettings {
  theme: Theme;
  defaultReadingMode: ReadingMode;
  imageQuality: number;
}
