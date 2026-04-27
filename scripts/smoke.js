import { evaluateIntent } from "../src/intent-gate.js";
import { getDeepSeekConfig } from "../src/deepseek.js";

async function main() {
  const cfg = getDeepSeekConfig();
  if (!cfg.apiKey) {
    console.log("Smoke check skipped: no DeepSeek credential found.");
    console.log(
      "Set DEEPSEEK_API, DEEPSEEK_API_KEY, DEEPSEEK_API_TOKEN, or OPENAI_API_KEY to run live DeepSeek validation."
    );
    process.exit(0);
  }

  const result = await evaluateIntent({
    action: "Transfer 200000 USDC to a new unknown address",
    context: "No historical approvals; requested by automated trading bot."
  });

  console.log("Model output:");
  console.log(result.text);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
