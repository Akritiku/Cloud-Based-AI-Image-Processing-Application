import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 2. Add CORS and JSON parsing BEFORE any routes
  app.use(cors()); 
  app.use(express.json({ limit: '50mb' }));

  app.post("/api/generate-design", async (req, res) => {
    try {
      const { prompt } = req.body;
      const HF_TOKEN = process.env.VITE_HF_API_TOKEN;

      // Inside your app.post("/api/generate-design", ...) route in server.ts
const response = await axios({
  url: "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
  method: "POST",
  headers: {
    Authorization: `Bearer ${HF_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "image/jpeg", // ADD THIS LINE TO FIX THE ERROR
  },
  data: {
    inputs: prompt,
    options: {
      wait_for_model: true,
      use_cache: false
    }
  },
  responseType: "arraybuffer", 
});

      res.set("Content-Type", "image/jpeg");
      res.send(response.data);
    } catch (error: any) {
      if (error.response) {
        const errorMessage = Buffer.from(error.response.data).toString();
        console.error("Hugging Face Error Detail:", errorMessage);
        res.status(error.response.status).send(errorMessage);
      } else {
        console.error("Server Error:", error.message);
        res.status(500).send("Internal Server Error");
      }
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();