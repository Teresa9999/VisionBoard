import { config } from "dotenv";

config({ path: ".env" });
config({ path: "../.env" });

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isRealAiEnabled() {
  return TRUE_VALUES.has((process.env.USE_REAL_AI || "").trim().toLowerCase());
}

export function assertRealAiEnabled() {
  if (!isRealAiEnabled()) {
    throw new Error("Real AI is disabled. Set USE_REAL_AI=true to call AI providers.");
  }
}
