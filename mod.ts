/**
 * @module
 * This is lib use std/cli, but make the result be able to have structure.
 *
 * @example
 * ```typescript
 * import { clapCli, type Command } from "@nobody/deno-clap";
 * const WebExt = {
 *   run: {
 *     description: "run the WebExt",
 *     default: true,
 *   },
 *   firefox: {
 *     description: "run with firefox",
 *     children: {
 *       port: {
 *         description: "with port",
 *         type: "number",
 *         default: 8000,
 *       },
 *       devtool: {
 *         description: "with devtool",
 *         type: "boolean",
 *         default: false,
 *       },
 *       profile: {
 *         description: "with profile",
 *         type: "string",
 *       },
 *     },
 *   },
 *   chromium: {
 *     description: "run with chromium",
 *     newDataDir: {
 *       description: "withNewDataDir",
 *       type: "boolean",
 *       default: true,
 *     },
 *   },
 *   targetDir: {
 *     description: "set the targetDir",
 *     default: "./",
 *     type: "string",
 *   },
 * } as const;
 *
 * const cmd: Command = {
 *   exeName: "web-ext",
 *   description: "web-ext in deno",
 *   author: "Decodetalkers",
 *   version: "0.1.0",
 * };
 * const results = clapCli(WebExt, cmd);
 *
 * console.log(results);
 * ```
 */

import { parseArgs } from "@std/cli";

import { brightYellow, green } from "@std/fmt/colors";

/*
 * This show the supported arg types
 */
export type ArgType = "number" | "string" | "boolean";

/*
 * This is the type of the args, but do not use it directly
 * Do not use it to mark the type of object, if do that, the type of children will always be Clap | undefined
 * Then the type system will not work
 */
export type Arg = {
  type?: ArgType;
  description: string;
  default?: string | number | boolean;
  children?: Clap;
};

function helpArg(arg: Arg, key: string) {
  const type = arg.type || "boolean";
  let usgeInfo = green(`--${key}`);
  if (type !== "boolean") {
    usgeInfo += ` {${type}}`;
  }
  const defaultValue = arg.default;
  if (defaultValue) {
    usgeInfo += `  (${defaultValue})`;
  }
  const description = arg.description;

  console.log(description);
  console.log();
  console.log(`${brightYellow("Usage")}: ${usgeInfo}`);
  if (!arg.children) {
    return;
  }
  console.log();
  console.log(brightYellow("Commands:"));
  for (const [key, child] of Object.entries(arg.children)) {
    const pre = green(` --${key}`.padEnd(25, " "));
    const end = child.description;
    console.log(pre + end);
  }
}

/**
 * The base information of The Command
 * contains the exeName, author, version and description.
 * author is choosable.
 */
export type Command = {
  exeName: string;
  author?: string;
  version: string;
  description: string;
};

function helpCommand(
  { exeName, author, description }: Command,
  arg: Clap,
) {
  console.log(description);
  console.log();
  if (author) {
    console.log(`${brightYellow("Author:")}: ${author}`);
    console.log();
  }
  console.log(`${brightYellow("Usage")}: ${green(exeName)} <COMMAND>`);
  console.log();
  console.log(brightYellow("Commands:"));
  for (const [key, child] of Object.entries(arg)) {
    const pre = green(`  --${key}`.padEnd(25, " "));
    const end = child.description;
    console.log(pre + end);
  }
  console.log();
  console.log(brightYellow("Options:"));
  console.log(green("  --help"));
  console.log(green("  --version"));
}

/**
 * It is used to auto generate the return type by the passed in value which extends Clap
 */
export type ExtractArgs<T extends Clap> = {
  [K in keyof T]?: T[K] extends { children: infer C extends Clap }
    ? ExtractArgs<C> // Recursively extract children
    : T[K]["type"] extends "number" ? number | undefined
    : T[K]["type"] extends "string" ? string | undefined
    : boolean | undefined;
};

/*
 * This is the type of the Clap, but do not use it directly
 * Do not use it to mark the type of object, if do that, the type of children will always be Clap | undefined
 * Then the type system will not work
 */
export type Clap = {
  [key: string]: Arg;
};

/*
 * It is similar with @std/cli, and it also uses that.
 * It can return a structured resulted, whose type is generated with that one passed in with value
 * Note: You need to mark the clapInit as Const, then the type system will work
 */
export function clapCli<T extends Clap>(
  clapInit: T,
  command: Command,
): ExtractArgs<T> | undefined {
  return parseCliArgs(Deno.args, clapInit, command);
}

/**
 * It is similar with clapCli, clapCli directly use the Deno.args and the input, if you use this one, you need to pass args manally.
 * I export it because I need to do unit test.
 */
export function parseCliArgs<T extends Clap>(
  args: string[],
  clapInit: T,
  command: Command,
): ExtractArgs<T> | undefined {
  // deno-lint-ignore no-explicit-any
  const result: { [key: string]: any } = {};
  const parsedArgs = parseArgs(args);
  const entries = Object.entries(parsedArgs).filter(([key, _]) => key !== "_");
  if (entries.length == 0 || entries[0][0] == "help") {
    helpCommand(command, clapInit);
    return;
  }

  if (entries[0][0] == "version") {
    console.log(command.version);
    return;
  }

  const len = entries.length;
  const index = 0;
  if (!parseCliArgsInner(clapInit, result, entries, index, len, false)) {
    return;
  }
  return result as ExtractArgs<T>;
}

function parseCliArgsInner<T extends Clap>(
  clapChild: T,
  // deno-lint-ignore no-explicit-any
  result: { [key: string]: any },
  // deno-lint-ignore no-explicit-any
  entries: [string, any][],
  index: number,
  maxLen: number,
  hasTop: boolean,
): number | undefined {
  while (index < maxLen) {
    const [key, value] = entries[index];
    if (!clapChild[key]) {
      if (!hasTop) {
        index += 1;
      } else {
        return index;
      }

      continue;
    }

    if (!clapChild[key].type) {
      clapChild[key].type = "boolean";
    }

    // deno-lint-ignore valid-typeof
    if (typeof value != clapChild[key].type) {
      const checkHelpIndex = index + 1;
      if (checkHelpIndex < maxLen) {
        if (entries[checkHelpIndex][0] == "help") {
          helpArg(clapChild[key], key);
          return undefined;
        }
      }
      index += 1;
      continue;
    }

    if (typeof value != "boolean" || !clapChild[key].children) {
      const checkHelpIndex = index + 1;
      if (checkHelpIndex < maxLen) {
        if (entries[checkHelpIndex][0] == "help") {
          helpArg(clapChild[key], key);
          return undefined;
        }
      }

      result[key] = value;
      index += 1;
      continue;
    }

    const checkHelpIndex = index + 1;
    if (checkHelpIndex < maxLen) {
      if (entries[checkHelpIndex][0] == "help") {
        helpArg(clapChild[key], key);
        return undefined;
      }
    }
    const childInit = clapChild[key].children;
    index += 1;
    // deno-lint-ignore no-explicit-any
    const temp: { [key: string]: any } = {};
    const newIndex = parseCliArgsInner(
      childInit,
      temp,
      entries,
      index,
      maxLen,
      false,
    );
    if (!newIndex) {
      return index;
    }
    result[key] = temp;
    index = newIndex;
  }
  for (const [key, child] of Object.entries(clapChild)) {
    if (result[key]) {
      continue;
    }
    if (!child.default) {
      continue;
    }
    result[key] = child.default;
  }

  return index;
}
