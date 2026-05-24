import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/app";

const handler = app as unknown as (req: VercelRequest, res: VercelResponse) => void;

export default handler;
