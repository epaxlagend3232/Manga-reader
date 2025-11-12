import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { storage } from "./storage";
import { analyzeAndTranslateMangaPage } from "./gemini";
import { insertMangaSchema, insertPlaylistSchema, insertReadingProgressSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const MANGA_DIR = path.join(UPLOADS_DIR, "manga");

async function ensureUploadsDir() {
  await fs.mkdir(MANGA_DIR, { recursive: true });
}

async function processImageFile(buffer: Buffer, filename: string, mangaId: string): Promise<string> {
  const outputPath = path.join(MANGA_DIR, mangaId, filename);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  await sharp(buffer)
    .jpeg({ quality: 90 })
    .toFile(outputPath);
  
  return `manga/${mangaId}/${filename}`;
}

async function processPDFFile(buffer: Buffer, mangaId: string): Promise<string[]> {
  const pdfDoc = await PDFDocument.load(buffer);
  const pageCount = pdfDoc.getPageCount();
  const pageUrls: string[] = [];
  
  await fs.mkdir(path.join(MANGA_DIR, mangaId), { recursive: true });
  
  const placeholderImageBuffer = await sharp({
    create: {
      width: 800,
      height: 1200,
      channels: 3,
      background: { r: 240, g: 240, b: 240 }
    }
  })
  .png()
  .toBuffer();

  for (let i = 0; i < pageCount; i++) {
    const filename = `page-${i + 1}.png`;
    const outputPath = path.join(MANGA_DIR, mangaId, filename);
    
    await fs.writeFile(outputPath, placeholderImageBuffer);
    pageUrls.push(`manga/${mangaId}/${filename}`);
  }
  
  return pageUrls;
}

async function processZipFile(buffer: Buffer, mangaId: string): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer);
  const pageUrls: string[] = [];
  const imageFiles: Array<{ name: string; data: Buffer }> = [];
  
  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir && /\.(jpe?g|png|gif|webp)$/i.test(filename)) {
      const data = await file.async("nodebuffer");
      imageFiles.push({ name: path.basename(filename), data });
    }
  }
  
  imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  
  for (let i = 0; i < imageFiles.length; i++) {
    const { data } = imageFiles[i];
    const filename = `page-${i + 1}.jpg`;
    const url = await processImageFile(data, filename, mangaId);
    pageUrls.push(url);
  }
  
  return pageUrls;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureUploadsDir();
  
  app.use("/uploads", express.static(UPLOADS_DIR));
  
  app.get("/api/mangas", async (req, res) => {
    try {
      const mangas = await storage.getMangas();
      res.json(mangas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mangas" });
    }
  });
  
  app.get("/api/mangas/:id", async (req, res) => {
    try {
      const manga = await storage.getManga(req.params.id);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      res.json(manga);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch manga" });
    }
  });
  
  app.post("/api/mangas/upload", upload.array("files", 100), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const { title, author, genre, description } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const mangaId = `manga-${Date.now()}`;
      let pageUrls: string[] = [];
      let fileType = "images";
      let coverUrl: string | null = null;
      
      if (files.length === 1) {
        const file = files[0];
        if (file.mimetype === "application/pdf") {
          fileType = "pdf";
          pageUrls = await processPDFFile(file.buffer, mangaId);
        } else if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
          fileType = "zip";
          pageUrls = await processZipFile(file.buffer, mangaId);
        } else {
          pageUrls = [await processImageFile(file.buffer, `page-1.jpg`, mangaId)];
        }
      } else {
        for (let i = 0; i < files.length; i++) {
          const url = await processImageFile(files[i].buffer, `page-${i + 1}.jpg`, mangaId);
          pageUrls.push(url);
        }
      }
      
      pageUrls.sort((a, b) => {
        const aNum = parseInt(a.match(/page-(\d+)/)?.[1] || "0");
        const bNum = parseInt(b.match(/page-(\d+)/)?.[1] || "0");
        return aNum - bNum;
      });
      
      coverUrl = pageUrls[0] || null;
      
      const manga = await storage.createManga({
        title,
        author: author || null,
        genre: genre || null,
        description: description || null,
        coverUrl,
        tags: genre ? [genre] : null,
        totalPages: pageUrls.length,
        fileType,
        files: pageUrls,
        isFavorite: "false",
      });
      
      res.json(manga);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload manga" });
    }
  });
  
  app.patch("/api/mangas/:id/favorite", async (req, res) => {
    try {
      const manga = await storage.toggleFavorite(req.params.id);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      res.json(manga);
    } catch (error) {
      res.status(500).json({ error: "Failed to update favorite" });
    }
  });
  
  app.delete("/api/mangas/:id", async (req, res) => {
    try {
      const success = await storage.deleteManga(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Manga not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete manga" });
    }
  });
  
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });
  
  app.post("/api/playlists", async (req, res) => {
    try {
      const data = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(data);
      res.json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });
  
  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const success = await storage.deletePlaylist(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });
  
  app.get("/api/progress/:mangaId", async (req, res) => {
    try {
      const progress = await storage.getReadingProgress(req.params.mangaId);
      if (!progress) {
        return res.json({
          mangaId: req.params.mangaId,
          currentPage: 0,
          bookmarks: [],
        });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reading progress" });
    }
  });
  
  app.post("/api/progress/:mangaId", async (req, res) => {
    try {
      const progress = await storage.updateReadingProgress({
        mangaId: req.params.mangaId,
        currentPage: req.body.currentPage || 0,
        bookmarks: req.body.bookmarks || [],
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reading progress" });
    }
  });
  
  app.post("/api/progress/:mangaId/bookmark", async (req, res) => {
    try {
      const progress = await storage.toggleBookmark(req.params.mangaId, req.body.page);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle bookmark" });
    }
  });
  
  app.get("/api/translations", async (req, res) => {
    try {
      const mangaId = req.query.mangaId as string | undefined;
      const translations = await storage.getTranslations(mangaId);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });
  
  app.post("/api/translate", async (req, res) => {
    try {
      const { mangaId, sourceLanguage, targetLanguage, pages } = req.body;
      
      const manga = await storage.getManga(mangaId);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      
      const translation = await storage.createTranslation({
        mangaId,
        sourceLanguage,
        targetLanguage,
        translatedPages: {},
        status: "processing",
      });
      
      setImmediate(async () => {
        try {
          const pagesToTranslate = pages || Array.from({ length: manga.totalPages }, (_, i) => i);
          const translatedPages: Record<number, string> = {};
          
          for (const pageIndex of pagesToTranslate.slice(0, 3)) {
            const pageRelativePath = manga.files[pageIndex];
            if (!pageRelativePath) continue;
            
            const imagePath = path.join(UPLOADS_DIR, pageRelativePath);
            const imageBuffer = await fs.readFile(imagePath);
            const base64 = imageBuffer.toString("base64");
            
            await analyzeAndTranslateMangaPage(base64, sourceLanguage, targetLanguage);
            translatedPages[pageIndex] = pageRelativePath;
          }
          
          await storage.updateTranslation(translation.id, {
            status: "completed",
            translatedPages,
          });
        } catch (error) {
          console.error("Translation error:", error);
          await storage.updateTranslation(translation.id, {
            status: "failed",
          });
        }
      });
      
      res.json(translation);
    } catch (error) {
      console.error("Translation start error:", error);
      res.status(500).json({ error: "Failed to start translation" });
    }
  });
  
  app.post("/api/translations/:id/export", async (req, res) => {
    try {
      const translation = await storage.getTranslation(req.params.id);
      if (!translation) {
        return res.status(404).json({ error: "Translation not found" });
      }
      
      const manga = await storage.getManga(translation.mangaId);
      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }
      
      const exportUrl = `/uploads/manga/${manga.id}/translated.pdf`;
      res.json({ url: exportUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to export translation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
