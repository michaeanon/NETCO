import { Router } from "express";
import { randomUUID } from "crypto";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  const body = parsed.data;
  const id = randomUUID();
  const amount = body.amount ?? calculateAmount(body.network, body.duration);

  const [order] = await db
    .insert(ordersTable)
    .values({
      id,
      packageId: body.packageId,
      network: body.network,
      duration: body.duration,
      appType: body.appType,
      deviceId: body.deviceId,
      phone: body.phone,
      amount: String(amount),
      status: "pending",
    })
    .returning();

  res.status(201).json(formatOrder(order));
});

router.get("/:id", async (req, res) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(formatOrder(order));
});

function calculateAmount(network: string, duration: string): number {
  const prices: Record<string, Record<string, number>> = {
    safaricom: { daily: 80, weekly: 350, monthly: 1000 },
    airtel: { daily: 70, weekly: 300, monthly: 900 },
    telkom: { daily: 60, weekly: 250, monthly: 750 },
  };
  return prices[network.toLowerCase()]?.[duration] ?? 80;
}

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    packageId: order.packageId,
    network: order.network,
    duration: order.duration,
    appType: order.appType,
    deviceId: order.deviceId,
    phone: order.phone,
    amount: Number(order.amount),
    status: order.status,
    paymentReference: order.paymentReference ?? null,
    configUrl: order.configUrl ?? null,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : null,
  };
}

export default router;
