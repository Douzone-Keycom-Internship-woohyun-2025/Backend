import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
  roots: ["<rootDir>/src/__tests__"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^.*/config/env$": "<rootDir>/src/__tests__/__mocks__/env.ts",
    "^.*/config/db$": "<rootDir>/src/__tests__/__mocks__/db.ts",
  },
};

export default config;
