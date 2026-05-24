import type { VercelRequest, VercelResponse } from "@vercel/node";

// Import the pre-built serverless bundle (plain JS, no TS type issues)
// @ts-ignore — built by esbuild before this function runs
import app from "../artifacts/api-server/dist/serverless.mjs";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
