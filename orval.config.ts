import { defineConfig } from "orval";

export default defineConfig({
  titipdong: {
    input: "./openapi/openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/api/generated/endpoints",
      schemas: "./src/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: { path: "./src/api/client.ts", name: "apiFetch" },
      },
    },
  },
  titipdongZod: {
    input: "./openapi/openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/api/generated/zod",
      client: "zod",
      fileExtension: ".zod.ts",
      clean: true,
    },
  },
});
