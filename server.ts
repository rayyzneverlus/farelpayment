import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const FR3_BASE_URL = "https://fr3newera.com/api/v1";
  const FR3_WITHDRAW_URL = "https://fr3newera.com/withdraw2";
  const DEFAULT_API_KEY = process.env.FR3_API_KEY || "";

  // Helper for requests
  const getApiKey = (req: express.Request) => {
    return req.headers["x-api-key"] || DEFAULT_API_KEY;
  };

  // API Proxy Routes
  app.get("/api/proxy/saldo", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const response = await axios.get(`${FR3_BASE_URL}/check-saldo`, {
        params: { apikey }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/topup", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { nominal } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/topup`, {
        apikey,
        nominal
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/cancel", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { trxId } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/topup/cancel`, {
        apikey,
        trxId
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/cancel", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { trxId } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/topup/cancel`, {
        apikey,
        trxId
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.get("/api/proxy/check-status", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { idTransaksi } = req.query;
      const response = await axios.get(`${FR3_BASE_URL}/check-status`, {
        params: { apikey, idTransaksi }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.get("/api/proxy/history", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { page, limit, filter } = req.query;
      const response = await axios.get(`${FR3_BASE_URL}/history`, {
        params: { apikey, page, limit, filter }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/check-user", async (req, res) => {
    try {
      const { email } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/check-user`, { email });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/transfer", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { email, nominal } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/transfer`, {
        apikey,
        email,
        nominal
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.get("/api/proxy/withdraw", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { ewallet, nomor, kode } = req.query;
      const response = await axios.get(FR3_WITHDRAW_URL, {
        params: { apikey, ewallet, nomor, kode }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  app.post("/api/proxy/cek-ewallet", async (req, res) => {
    try {
      const apikey = getApiKey(req);
      const { code, dest } = req.body;
      const response = await axios.post(`${FR3_BASE_URL}/cek`, {
        apikey,
        code,
        dest
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
