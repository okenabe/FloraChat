import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertGardenBedSchema,
  insertPlantSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const user = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(user);
      res.json(newUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Garden bed routes
  app.get("/api/beds", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const beds = await storage.getGardenBedsByUser(userId);
      res.json(beds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/beds/:id", async (req, res) => {
    try {
      const bed = await storage.getGardenBed(req.params.id);
      if (!bed) {
        return res.status(404).json({ error: "Garden bed not found" });
      }
      res.json(bed);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/beds", async (req, res) => {
    try {
      const bed = insertGardenBedSchema.parse(req.body);
      const newBed = await storage.createGardenBed(bed);
      res.json(newBed);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/beds/:id", async (req, res) => {
    try {
      const updated = await storage.updateGardenBed(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/beds/:id", async (req, res) => {
    try {
      await storage.deleteGardenBed(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Plant routes
  app.get("/api/plants", async (req, res) => {
    try {
      const bedId = req.query.bedId as string;
      if (!bedId) {
        return res.status(400).json({ error: "bedId is required" });
      }
      const plants = await storage.getPlantsByBed(bedId);
      res.json(plants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/plants/:id", async (req, res) => {
    try {
      const plant = await storage.getPlant(req.params.id);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found" });
      }
      res.json(plant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/plants", async (req, res) => {
    try {
      const plant = insertPlantSchema.parse(req.body);
      const newPlant = await storage.createPlant(plant);
      res.json(newPlant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/plants/:id", async (req, res) => {
    try {
      const updated = await storage.updatePlant(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/plants/:id", async (req, res) => {
    try {
      await storage.deletePlant(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Photo upload route
  app.post("/api/upload", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Create uploads directory if it doesn't exist
      await fs.mkdir("uploads", { recursive: true });

      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join("uploads", filename);

      await fs.rename(req.file.path, filepath);

      res.json({ 
        url: `/uploads/${filename}`,
        filename 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Plant identification route (will integrate with Plant.id API)
  app.post("/api/identify-plant", async (req, res) => {
    try {
      const { imageUrl, base64Image } = req.body;

      if (!process.env.PLANTID_API_KEY) {
        return res.status(503).json({ 
          error: "Plant identification service not configured. Please add PLANTID_API_KEY." 
        });
      }

      // Call Plant.id API
      const response = await fetch("https://api.plant.id/v3/identification", {
        method: "POST",
        headers: {
          "Api-Key": process.env.PLANTID_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: [base64Image],
          details: ["common_names", "url", "taxonomy", "description"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Plant.id API error:", errorData);
        throw new Error(`Plant.id API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversation for user
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.userId);
      if (!conversation) {
        return res.status(404).json({ error: "No conversation found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat/conversation route (will integrate with OpenAI)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId, conversationId } = req.body;

      // Get or create conversation
      let conversation = await storage.getConversation(userId);

      const messages = conversation 
        ? JSON.parse(conversation.messages)
        : [];

      messages.push({ role: "user", content: message });

      let assistantMessage: string;

      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        assistantMessage = "I'm not fully configured yet (missing OpenAI API key), but I've saved your message! You can still browse your garden beds and I'll remember our conversation.";
      } else {
        try {
        // Call OpenAI API for entity extraction and response
        const systemPrompt = `You are a helpful garden assistant that helps users catalog plants. 
Extract structured data from user messages about plants, including:
- Plant names (common or scientific)
- Quantities
- Time references
- Sun exposure
- Soil conditions
- Health status
- Location hints

Be conversational and helpful. Ask clarifying questions when needed.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || response.statusText);
        }

          const data = await response.json();
          assistantMessage = data.choices[0].message.content;
        } catch (error: any) {
          // If OpenAI fails, provide a helpful fallback message
          assistantMessage = "I'm having trouble connecting to my AI service right now. Could you try again in a moment? Your message has been saved.";
          console.error("OpenAI API error:", error);
        }
      }

      messages.push({ role: "assistant", content: assistantMessage });

      // Save conversation regardless of OpenAI success/failure
      if (conversation) {
        conversation = await storage.updateConversation(conversation.id, {
          messages: JSON.stringify(messages),
        });
      } else {
        conversation = await storage.createConversation({
          userId,
          messages: JSON.stringify(messages),
          context: null,
        });
      }

      res.json({ 
        message: assistantMessage,
        conversationId: conversation.id,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.sendFile(path.join(process.cwd(), "uploads", req.path));
  });

  const httpServer = createServer(app);
  return httpServer;
}
