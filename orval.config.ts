import { defineConfig } from "orval";

// src/api/generated is in .prettierignore, so point prettier at .gitignore only to format the generated files.
const formatGenerated = { afterAllFilesWrite: "prettier --write --ignore-path .gitignore" };

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
        // apiFetch throws ApiError on non-2xx, so hooks return the success body directly.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
    hooks: formatGenerated,
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
    hooks: formatGenerated,
  },
});
