import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import {
  insertMangaSchema,
  insertPlaylistSchema,
  insertReadingProgressSchema,
  insertTranslationSchema,
  insertSettingsSchema,
} from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const coversDir = path.join(uploadDir, "covers");
const pagesDir = path.join(uploadDir, "pages");
const translationsDir = path.join(uploadDir, "translations");

// Ensure upload directories exist
async function ensureDirectories() {
  for (const dir of [uploadDir, coversDir, pagesDir, translationsDir]) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      await ensureDirectories();
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to process uploaded files
async function processUploadedFiles(
  files: Express.Multer.File[]
): Promise<{ pages: string[]; cover: string; totalPages: number; fileType: string }> {
  const pages: string[] = [];
  let cover = "";
  let fileType = "images";

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {
      fileType = "pdf";
      // Extract pages from PDF
      const pdfBytes = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      // Move PDF to uploads directory
      const pdfFilename = `${Date.now()}-${file.originalname}`;
      const pdfPath = path.join(uploadDir, pdfFilename);
      await fs.rename(file.path, pdfPath);

      // For now, we'll store the PDF URL (in production, extract pages as images)
      const pdfUrl = `/uploads/${pdfFilename}`;
      pages.push(pdfUrl);
      cover = pdfUrl; // Simplified - would generate thumbnail
    } else if (ext === ".zip") {
      fileType = "zip";
      // Move ZIP to uploads directory
      const zipFilename = `${Date.now()}-${file.originalname}`;
      const zipPath = path.join(uploadDir, zipFilename);
      await fs.rename(file.path, zipPath);

      // For ZIP files, store the URL (in production, extract and process)
      const zipUrl = `/uploads/${zipFilename}`;
      pages.push(zipUrl);
      cover = zipUrl; // Simplified - would extract and use first image
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      // Process image files
      const filename = path.basename(file.path);
      const pagePath = path.join(pagesDir, filename);

      // Optimize and move to pages directory
      await sharp(file.path)
        .resize(1200, 1800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toFile(pagePath);

      // Store as relative URL path that browser can fetch
      pages.push(`/uploads/pages/${filename}`);

      // Use first image as cover
      if (!cover) {
        const coverFilename = `cover-${filename}`;
        const coverPath = path.join(coversDir, coverFilename);

        await sharp(file.path)
          .resize(400, 600, { fit: "cover" })
          .webp({ quality: 85 })
          .toFile(coverPath);

        // Store as relative URL path that browser can fetch
        cover = `/uploads/covers/${coverFilename}`;
      }

      // Remove original uploaded file
      await fs.unlink(file.path);
    }
  }

  return {
    pages,
    cover,
    totalPages: pages.length,
    fileType,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure directories exist on startup
  await ensureDirectories();

  // Serve uploaded files statically
  const express = await import("express");
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use("/uploads", express.default.static(uploadDir));

  // ==================== MANGA ENDPOINTS ====================

  // Get all manga
  app.get("/api/manga", async (req, res) => {
    try {
      const mangas = await storage.getAllMangas();
      res.json(mangas);
    } catch (error) {
      console.error("Error fetching manga:", error);
      res.status(500).json({ error: "Failed to fetch manga" });
    }
  });

  // Get single manga
  app.get("/api/manga/:id", async (req, res) => {
    try {
      const manga = await storage.getManga(req.params.id);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      res.json(manga);
    } catch (error) {
      console.error("Error fetching manga:", error);
      res.status(500).json({ error: "Failed to fetch manga" });
    }
  });

  // Upload manga
  app.post("/api/manga/upload", upload.array("files", 100), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const { title, author, genre, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Process uploaded files
      const { pages, cover, totalPages, fileType } = await processUploadedFiles(files);

      // Create manga record
      const manga = await storage.createManga({
        title,
        author: author || null,
        genre: genre || null,
        description: description || null,
        coverUrl: cover,
        totalPages,
        fileType,
        files: pages,
        isFavorite: false,
      });

      res.json(manga);
    } catch (error) {
      console.error("Error uploading manga:", error);
      res.status(500).json({ error: "Failed to upload manga" });
    }
  });

  // Update manga
  app.patch("/api/manga/:id", async (req, res) => {
    try {
      const updates = req.body;
      const manga = await storage.updateManga(req.params.id, updates);

      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }

      res.json(manga);
    } catch (error) {
      console.error("Error updating manga:", error);
      res.status(500).json({ error: "Failed to update manga" });
    }
  });

  // Toggle favorite
  app.post("/api/manga/:id/favorite", async (req, res) => {
    try {
      const manga = await storage.toggleFavorite(req.params.id);

      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }

      res.json(manga);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  // Delete manga
  app.delete("/api/manga/:id", async (req, res) => {
    try {
      const manga = await storage.getManga(req.params.id);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }

      // Convert URL paths back to filesystem paths and delete files
      if (manga.coverUrl) {
        const coverPath = path.join(process.cwd(), manga.coverUrl.replace(/^\//, ''));
        if (existsSync(coverPath)) {
          await fs.unlink(coverPath);
        }
      }

      for (const fileUrl of manga.files as string[]) {
        const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
        if (existsSync(filePath)) {
          await fs.unlink(filePath);
        }
      }

      await storage.deleteManga(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting manga:", error);
      res.status(500).json({ error: "Failed to delete manga" });
    }
  });

  // Search manga
  app.get("/api/manga/search/:query", async (req, res) => {
    try {
      const mangas = await storage.searchMangas(req.params.query);
      res.json(mangas);
    } catch (error) {
      console.error("Error searching manga:", error);
      res.status(500).json({ error: "Failed to search manga" });
    }
  });

  // ==================== PLAYLIST ENDPOINTS ====================

  // Get all playlists
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getAllPlaylists();
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  // Get single playlist
  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  });

  // Create playlist
  app.post("/api/playlists", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Playlist name is required" });
      }

      const playlist = await storage.createPlaylist({
        name,
        mangaIds: [],
      });

      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  // Add manga to playlist
  app.post("/api/playlists/:id/manga/:mangaId", async (req, res) => {
    try {
      const playlist = await storage.addMangaToPlaylist(req.params.id, req.params.mangaId);

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      res.json(playlist);
    } catch (error) {
      console.error("Error adding manga to playlist:", error);
      res.status(500).json({ error: "Failed to add manga to playlist" });
    }
  });

  // Remove manga from playlist
  app.delete("/api/playlists/:id/manga/:mangaId", async (req, res) => {
    try {
      const playlist = await storage.removeMangaFromPlaylist(req.params.id, req.params.mangaId);

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      res.json(playlist);
    } catch (error) {
      console.error("Error removing manga from playlist:", error);
      res.status(500).json({ error: "Failed to remove manga from playlist" });
    }
  });

  // Delete playlist
  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      await storage.deletePlaylist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });

  // ==================== READING PROGRESS ENDPOINTS ====================

  // Get reading progress for manga
  app.get("/api/progress/:mangaId", async (req, res) => {
    try {
      const progress = await storage.getReadingProgress(req.params.mangaId);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch reading progress" });
    }
  });

  // Save/update reading progress
  app.post("/api/progress", async (req, res) => {
    try {
      const { mangaId, currentPage, bookmarks } = req.body;

      if (!mangaId || currentPage === undefined) {
        return res.status(400).json({ error: "mangaId and currentPage are required" });
      }

      const progress = await storage.saveReadingProgress({
        mangaId,
        currentPage,
        bookmarks: bookmarks || [],
      });

      res.json(progress);
    } catch (error) {
      console.error("Error saving progress:", error);
      res.status(500).json({ error: "Failed to save reading progress" });
    }
  });

  // ==================== TRANSLATION ENDPOINTS ====================

  // Get all translations
  app.get("/api/translations", async (req, res) => {
    try {
      const translations = await storage.getAllTranslations();
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  // Get translations for manga
  app.get("/api/translations/manga/:mangaId", async (req, res) => {
    try {
      const translations = await storage.getTranslationsByManga(req.params.mangaId);
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  // Create translation (initiate translation job)
  app.post("/api/translations", async (req, res) => {
    try {
      const { mangaId, sourceLanguage, targetLanguage } = req.body;

      if (!mangaId || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({
          error: "mangaId, sourceLanguage, and targetLanguage are required",
        });
      }

      const translation = await storage.createTranslation({
        mangaId,
        sourceLanguage,
        targetLanguage,
        translatedPages: {},
        status: "pending",
      });

      // In a real app, you'd queue this for background processing
      // For now, we'll mark it as processing
      await storage.updateTranslation(translation.id, { status: "processing" });

      res.json(translation);
    } catch (error) {
      console.error("Error creating translation:", error);
      res.status(500).json({ error: "Failed to create translation" });
    }
  });

  // Update translation status
  app.patch("/api/translations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const translation = await storage.updateTranslation(req.params.id, updates);

      if (!translation) {
        return res.status(404).json({ error: "Translation not found" });
      }

      res.json(translation);
    } catch (error) {
      console.error("Error updating translation:", error);
      res.status(500).json({ error: "Failed to update translation" });
    }
  });

  // Delete translation
  app.delete("/api/translations/:id", async (req, res) => {
    try {
      await storage.deleteTranslation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting translation:", error);
      res.status(500).json({ error: "Failed to delete translation" });
    }
  });

  // ==================== SETTINGS ENDPOINTS ====================

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || { theme: "light", defaultReadingMode: "single", imageQuality: 100 });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Save settings
  app.post("/api/settings", async (req, res) => {
    try {
      const { theme, defaultReadingMode, imageQuality } = req.body;

      const settings = await storage.saveSettings({
        theme: theme || "light",
        defaultReadingMode: defaultReadingMode || "single",
        imageQuality: imageQuality || 100,
      });

      res.json(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
