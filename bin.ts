import { clapCli, type Command } from "./mod.ts";

const WebExt = {
  run: {
    description: "run the WebExt",
    default: true,
  },
  firefox: {
    description: "run with firefox",
    children: {
      port: {
        description: "with port",
        type: "number",
        default: 8000,
      },
      devtool: {
        description: "with devtool",
        type: "boolean",
        default: false,
      },
      profile: {
        description: "with profile",
        type: "string",
      },
    },
  },
  chromium: {
    description: "run with chromium",
    children: {
      newDataDir: {
        description: "withNewDataDir",
        type: "boolean",
        default: true,
      },
    },
  },
  targetDir: {
    description: "set the targetDir",
    default: "./",
    type: "string",
  },
} as const;

const cmd: Command = {
  exeName: "web-ext",
  description: "web-ext in deno",
  author: "Decodetalkers",
  version: "0.1.0",
};

const result = clapCli(WebExt, cmd);

console.log();
console.log("result is", result);
