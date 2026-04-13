import { generateWithMock } from "./mock-generator-safe.mjs";
import { generateWithOpenAI } from "./openai-compatible.mjs";
import { useRemoteModel } from "./config.mjs";

export async function generateMoonBitArtifact(prompt, history = []) {
  if (useRemoteModel()) {
    try {
      const result = await generateWithOpenAI(prompt, history);
      return { ...result, adapter: "openai-compatible" };
    } catch (error) {
      return {
        ...generateWithMock(prompt),
        adapter: "mock-fallback",
        warning: `远端模型调用失败，已回退到本地规则生成器：${error.message}`,
      };
    }
  }

  return {
    ...generateWithMock(prompt),
    adapter: "mock",
  };
}
