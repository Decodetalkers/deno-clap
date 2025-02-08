import { parseArgs } from "@std/cli";

import { brightYellow, green } from "@std/fmt/colors";

type ArgType = "number" | "string" | "boolean";

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
    const pre = green(`  --${key}`.padEnd(15, " "));
    const end = child.description;
    console.log(pre + end);
  }
}

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
    const pre = green(`  --${key}`.padEnd(15, " "));
    const end = child.description;
    console.log(pre + end);
  }
  console.log();
  console.log(brightYellow("Options:"));
  console.log(green("  --help"));
  console.log(green("  --version"));
}

// Type mapping function to extract the expected output structure
type ExtractArgs<T extends Clap> = {
  [K in keyof T]?: T[K] extends { children: infer C extends Clap }
    ? ExtractArgs<C> // Recursively extract children
    : T[K]["type"] extends "number" ? number | undefined
    : T[K]["type"] extends "string" ? string | undefined
    : boolean | undefined;
};

export type Clap = {
  [key: string]: Arg;
};

export function cli<T extends Clap>(
  clapInit: T,
  command: Command,
): ExtractArgs<T> | undefined {
  return parseCliArgs(Deno.args, clapInit, command);
}

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
  let index = 0;
  while (index < len) {
    const [key, value] = entries[index];
    if (!clapInit[key]) {
      index += 1;
      continue;
    }

    if (!clapInit[key].type) {
      clapInit[key].type = "boolean";
    }

    // deno-lint-ignore valid-typeof
    if (typeof value != clapInit[key].type) {
      const checkHelpIndex = index + 1;
      if (checkHelpIndex < len) {
        if (entries[checkHelpIndex][0] == "help") {
          helpArg(clapInit[key], key);
          return;
        }
      }
      index += 1;
      continue;
    }

    if (typeof value != "boolean" || !clapInit[key].children) {
      const checkHelpIndex = index + 1;
      if (checkHelpIndex < len) {
        if (entries[checkHelpIndex][0] == "help") {
          helpArg(clapInit[key], key);
          return;
        }
      }

      result[key] = value;
      index += 1;
      continue;
    }

    const checkHelpIndex = index + 1;
    if (checkHelpIndex < len) {
      if (entries[checkHelpIndex][0] == "help") {
        helpArg(clapInit[key], key);
        return;
      }
    }
    const childInit = clapInit[key].children;

    // deno-lint-ignore no-explicit-any
    const temp: { [key: string]: any } = {};
    let tempIndex = index;
    while (tempIndex < len) {
      tempIndex += 1;
      if (tempIndex >= len) {
        tempIndex -= 1;
        break;
      }
      const [key, value] = entries[tempIndex];
      if (!childInit[key]) {
        tempIndex -= 1;
        break;
      }
      if (!childInit[key].type) {
        childInit[key].type = "boolean";
      }
      // deno-lint-ignore valid-typeof
      if (typeof value != childInit[key].type) {
        const checkHelpIndex = tempIndex + 1;
        if (checkHelpIndex < len) {
          if (entries[checkHelpIndex][0] == "help") {
            helpArg(childInit[key], key);
            return;
          }
        }
        index += 1;
        tempIndex -= 1;
        break;
      }
      temp[key] = value;
    }

    for (const [key, child] of Object.entries(childInit)) {
      if (temp[key]) {
        continue;
      }
      if (!child.default) {
        continue;
      }
      temp[key] = child.default;
    }

    result[key] = temp;
    index = tempIndex + 1;
  }

  for (const [key, child] of Object.entries(clapInit)) {
    if (result[key]) {
      continue;
    }
    if (!child.default) {
      continue;
    }
    result[key] = child.default;
  }
  return result as ExtractArgs<T>;
}
