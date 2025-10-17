// @ts-check

// import perfectionistPlugin from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

// const { configs: perfectionistConfigs } = perfectionistPlugin;

export default tseslint.config(
  {
    ignores: ["node_modules/**", "dist/**", "**/*.js"],
  },

  // 2️⃣ Base + TS recommended configs
  // tseslint.configs.strictTypeChecked,
  // tseslint.configs.stylisticTypeChecked,
  tseslint.configs.recommended,

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // existing rules...
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  // perfectionistConfigs[""],
);
