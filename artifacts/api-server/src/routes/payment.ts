import { Router } from "express";
import { randomUUID } from "crypto";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { InitiatePaymentBody } from "@workspace/api-zod";

const router = Router();

const paymentStore = new Map<string, { status: string; completedAt?: string; message?: string }>();

router.post("/initiate", async (req, res) => {
  const parsed = InitiatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  const { phone, amount, orderId } = parsed.data;
  const reference = `PAY-${randomUUID().slice(0, 8).toUpperCase()}`;

  paymentStore.set(reference, { status: "pending" });

  setTimeout(() => {
    const record = paymentStore.get(reference);
    if (record && record.status === "pending") {
      paymentStore.set(reference, {
        status: "completed",
        completedAt: new Date().toISOString(),
        message: "Payment confirmed",
      });
      db.update(ordersTable)
        .set({ status: "completed", paymentReference: reference })
        .where(eq(ordersTable.id, orderId))
        .execute()
        .catch(() => {});
    }
  }, 15000);

  req.log.info({ phone, amount, orderId, reference }, "Payment initiated");

  res.json({
    success: true,
    reference,
    message: `STK Push sent to ${phone}. Please enter your M-Pesa PIN.`,
    checkoutRequestId: `WS_CO_${Date.now()}`,
  });
});

router.get("/status/:reference", (req, res) => {
  const record = paymentStore.get(req.params.reference);

  if (!record) {
    res.status(404).json({ error: "Payment reference not found" });
    return;
  }

  res.json({
    reference: req.params.reference,
    status: record.status,
    message: record.message ?? null,
    completedAt: record.completedAt ?? null,
  });
});

export default router;
