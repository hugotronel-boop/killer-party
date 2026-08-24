import { assertAppDataServerOnly } from "./server-only.ts";
assertAppDataServerOnly();
export async function callTool() { throw new Error("Connectors disabled."); }
