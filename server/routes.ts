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
import { GoogleGenAI } from "@google/genai";

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
      const response = await fetch("https://api.plant.id/v3/identification?details=common_names,url,taxonomy,wiki_description", {
        method: "POST",
        headers: {
          "Api-Key": process.env.PLANTID_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: [base64Image],
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

      // Ensure message has valid content
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: "Message cannot be empty" });
      }

      messages.push({ role: "user", content: message });

      let assistantMessage: string;

      // Check if Gemini is configured
      if (!process.env.GEMINI_API_KEY) {
        assistantMessage = "I'm not fully configured yet (missing Gemini API key), but I've saved your message! You can still browse your garden beds and I'll remember our conversation.";
      } else {
        try {
          // Initialize Gemini AI - using blueprint:javascript_gemini
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

          // System prompt for garden assistant
          const systemPrompt = `You are a helpful garden assistant that helps users catalog plants. 
When users tell you about plants, you MUST use the add_plant_to_bed function for EACH plant they mention.

IMPORTANT: Call add_plant_to_bed separately for each plant. If the user mentions multiple plants, make multiple function calls - one per plant.

Example: If user says "add rose, tulip, and daisy to my garden bed", you must:
1. Call add_plant_to_bed for rose
2. Call add_plant_to_bed for tulip  
3. Call add_plant_to_bed for daisy

Extract structured data including:
- Plant names (common or scientific)
- Quantities (default 1 if not specified)
- Garden bed names/locations
- Sun exposure
- Soil conditions
- Health status

Always use the functions to save the data. Be conversational and helpful.`;

          // Define function declarations for Gemini
          const tools = [
            {
              functionDeclarations: [
              {
                name: "create_garden_bed",
                description: "Create a new garden bed in the user's garden",
                parameters: {
                  type: "OBJECT" as const,
                  properties: {
                    bedName: {
                      type: "STRING" as const,
                      description: "Name or location of the garden bed (e.g., 'Front Yard', 'Vegetable Garden')"
                    },
                    sunExposure: {
                      type: "STRING" as const,
                      description: "Sun exposure level: full_sun, partial_shade, or full_shade"
                    },
                    soilType: {
                      type: "STRING" as const,
                      description: "Type of soil: clay, sandy, loamy, or silty"
                    },
                    notes: {
                      type: "STRING" as const,
                      description: "Additional notes about the bed"
                    }
                  },
                  required: ["bedName"]
                }
              },
              {
                name: "add_plant_to_bed",
                description: "Add a plant to a garden bed",
                parameters: {
                  type: "OBJECT" as const,
                  properties: {
                    bedName: {
                      type: "STRING" as const,
                      description: "Name of the garden bed where this plant is located"
                    },
                    commonName: {
                      type: "STRING" as const,
                      description: "Common name of the plant"
                    },
                    scientificName: {
                      type: "STRING" as const,
                      description: "Scientific name of the plant"
                    },
                    quantity: {
                      type: "INTEGER" as const,
                      description: "Number of plants"
                    },
                    healthStatus: {
                      type: "STRING" as const,
                      description: "Current health status: healthy, needs_attention, or unhealthy"
                    },
                    notes: {
                      type: "STRING" as const,
                      description: "Additional notes about the plant"
                    }
                  },
                  required: ["bedName", "commonName"]
                }
              }
            ]
            }
          ];

          // Convert messages to Gemini format, filtering out any messages with empty content
          const geminiHistory = messages
            .slice(0, -1)
            .filter((msg: any) => msg.content && msg.content.trim().length > 0)
            .map((msg: any) => ({
              role: msg.role === "assistant" ? "model" : "user",
              parts: [{ text: msg.content }],
            }));

          // Call Gemini API using gemini-2.5-flash model with function calling
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
              systemInstruction: systemPrompt,
              tools,
            },
            contents: [
              ...geminiHistory,
              {
                role: "user",
                parts: [{ text: message }],
              },
            ],
          });

          // Handle function calls - process ALL of them
          let assistantMessage: string;
          const functionCalls = response.functionCalls;
          
          // Log what Gemini wants to do
          console.log("Gemini function calls:", JSON.stringify(functionCalls, null, 2));
          console.log("Gemini response text:", response.text);
          
          if (functionCalls && functionCalls.length > 0) {
            const results: string[] = [];
            let createdBed: any = null;
            const plantsAdded: string[] = [];
            
            // Process all function calls
            for (const functionCall of functionCalls) {
              const { name, args } = functionCall;
              
              if (name === "create_garden_bed") {
                // Create the garden bed
                createdBed = await storage.createGardenBed({
                  userId,
                  bedName: args.bedName,
                  sunExposure: args.sunExposure || null,
                  soilType: args.soilType || null,
                  notes: args.notes || null,
                  bedSizeSqft: null,
                  soilMoisture: null,
                });
                results.push(`Created "${args.bedName}" garden bed`);
              } else if (name === "add_plant_to_bed") {
                // Find or create the bed
                const beds = await storage.getGardenBedsByUser(userId);
                let bed = beds.find(b => b.bedName.toLowerCase() === args.bedName.toLowerCase());
                
                if (!bed) {
                  // Create the bed if it doesn't exist
                  bed = await storage.createGardenBed({
                    userId,
                    bedName: args.bedName,
                    sunExposure: null,
                    soilType: null,
                    notes: null,
                    bedSizeSqft: null,
                    soilMoisture: null,
                  });
                  results.push(`Created "${args.bedName}" garden bed`);
                }
                
                // Add the plant
                await storage.createPlant({
                  bedId: bed.id,
                  commonName: args.commonName,
                  scientificName: args.scientificName || null,
                  quantity: args.quantity || 1,
                  healthStatus: args.healthStatus || null,
                  notes: args.notes || null,
                  plantType: null,
                  datePlanted: null,
                  imageUrl: null,
                  spacingInches: null,
                  currentHeight: null,
                  identificationConfidence: null,
                });
                
                const qty = args.quantity || 1;
                plantsAdded.push(`${qty} ${args.commonName}`);
              }
            }
            
            // Build a friendly response message
            if (plantsAdded.length > 0) {
              const bedName = createdBed?.bedName || functionCalls[0].args.bedName;
              assistantMessage = `Perfect! I've added the following to the "${bedName}" bed:\n${plantsAdded.map(p => `• ${p}`).join('\n')}\n\nCheck the Beds page to see your garden!`;
            } else if (createdBed) {
              assistantMessage = `Great! I've created the "${createdBed.bedName}" garden bed for you. You can now add plants to it!`;
            } else {
              assistantMessage = results.join('. ') || response.text || "Done!";
            }
          } else {
            assistantMessage = response.text || "I'm sorry, I couldn't process that.";
          }
        } catch (error: any) {
          // If Gemini fails, provide a helpful fallback message
          assistantMessage = "I'm having trouble connecting to my AI service right now. Could you try again in a moment? Your message has been saved.";
          console.error("Gemini API error:", error);
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
