import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Hydrating state from localStorage requires setState inside useEffect,
      // since the browser-only API can't be read during SSR. This is the
      // documented pattern, so the React Compiler rule is a false positive here.
      "react-hooks/set-state-in-effect": "off",
      // Fires on memoization the compiler can't prove it can preserve; the
      // code is correct, only the optimization is being skipped.
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);

export default eslintConfig;
