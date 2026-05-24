import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { db, configServersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".ehi" || ext === ".hc") {
      cb(null, true);
    } else {
      cb(new Error("Only .ehi and .hc config files are allowed"));
    }
  },
});

router.get("/admin/servers", async (req, res) => {
  const servers = await db
    .select()
    .from(configServersTable)
    .orderBy(configServersTable.createdAt);
  res.json(servers);
  return;
});

router.post("/admin/servers", upload.single("configFile"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Config file (.ehi or .hc) is required" });
    return;
  }

  const { serverName, network, appType, planType, duration } = req.body as Record<string, string>;

  if (!serverName || !network || !appType || !planType || !duration) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ error: "All fields are required: serverName, network, appType, planType, duration" });
    return;
  }

  const id = randomUUID();
  const [server] = await db
    .insert(configServersTable)
    .values({
      id,
      serverName,
      network,
      appType,
      planType,
      duration,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: "active",
    })
    .returning();

  req.log.info({ id, serverName, network, appType }, "Config server added");
  res.status(201).json(server);
  return;
});

router.patch("/admin/servers/:id", async (req, res) => {
  const id = req.params["id"] as string;
  const { status } = req.body as { status?: string };

  if (!status || !["active", "inactive"].includes(status)) {
    res.status(400).json({ error: "status must be 'active' or 'inactive'" });
    return;
  }

  const [updated] = await db
    .update(configServersTable)
    .set({ status })
    .where(eq(configServersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Config server not found" });
    return;
  }

  res.json(updated);
  return;
});

router.put("/admin/servers/:id/file", upload.single("configFile"), async (req, res) => {
  const id = req.params["id"] as string;

  if (!req.file) {
    res.status(400).json({ error: "Config file (.ehi or .hc) is required" });
    return;
  }

  const [existing] = await db
    .select()
    .from(configServersTable)
    .where(eq(configServersTable.id, id))
    .limit(1);

  if (!existing) {
    fs.unlinkSync(req.file.path);
    res.status(404).json({ error: "Config server not found" });
    return;
  }

  const oldPath = path.join(UPLOADS_DIR, existing.filename);
  if (fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }

  const [updated] = await db
    .update(configServersTable)
    .set({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
    })
    .where(eq(configServersTable.id, id))
    .returning();

  req.log.info({ id, newFile: req.file.filename }, "Config file replaced");
  res.json(updated);
  return;
});

router.delete("/admin/servers/:id", async (req, res) => {
  const id = req.params["id"] as string;

  const [existing] = await db
    .select()
    .from(configServersTable)
    .where(eq(configServersTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Config server not found" });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, existing.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await db.delete(configServersTable).where(eq(configServersTable.id, id));

  req.log.info({ id }, "Config server deleted");
  res.json({ success: true });
  return;
});

router.get("/admin/servers/:id/download", async (req, res) => {
  const id = req.params["id"] as string;

  const [server] = await db
    .select()
    .from(configServersTable)
    .where(eq(configServersTable.id, id))
    .limit(1);

  if (!server) {
    res.status(404).json({ error: "Config server not found" });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, server.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found on disk" });
    return;
  }

  res.setHeader("Content-Disposition", `attachment; filename="${server.originalName}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.sendFile(filePath);
  return;
});

export default router;
