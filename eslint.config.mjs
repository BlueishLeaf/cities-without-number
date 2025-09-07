import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

const foundryGlobals = {
  foundry: "readonly",
  game: "readonly",
  duplicate: "readonly",
  loadTemplates: "readonly",
  CONFIG: "readonly",
  Handlebars: "readonly",
  TextEditor: "readonly",
  Hooks: "readonly",
  SortingHelpers: "readonly",
  Actor: "readonly",
  Actors: "readonly",
  ActorSheet: "readonly",
  Item: "readonly",
  Items: "readonly",
  ItemSheet: "readonly",
  Dialog: "readonly",
  ChatMessage: "readonly",
  Roll: "readonly",
};

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jquery,
        ...foundryGlobals,
      },
    },
  },
]);
