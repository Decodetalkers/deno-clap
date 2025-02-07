import { parseArgs } from "@std/cli";

type ArgType = "number" | "string" | "boolean";

export type Arg = {
  type?: ArgType;
  description: string;
  default?: string | number | boolean;
  children?: Clap;
};

// Type mapping function to extract the expected output structure
type ExtractArgs<T extends Clap> = {
  [K in keyof T]: T[K] extends { children: infer C extends Clap }
    ? ExtractArgs<C> | boolean // Recursively extract children
    : T[K]["type"] extends "number" ? number | undefined
    : T[K]["type"] extends "string" ? string | undefined
    : boolean | undefined;
};

export type Clap = {
  [key: string]: Arg;
};

export function cli<T extends Clap>(init: T): ExtractArgs<T> {
  return parseCliArgs(Deno.args, init);
}

export function parseCliArgs<T extends Clap>(
  args: string[],
  init: T,
): ExtractArgs<T> {
  // deno-lint-ignore no-explicit-any
  const result: { [key: string]: any } = {};
  const parsedArgs = parseArgs(args);
  const entries = Object.entries(parsedArgs).filter(([key, _]) => key !== "_");
  const len = entries.length;
  let index = 0;
  while (index < len) {
    const [key, value] = entries[index];
    if (!init[key]) {
      index += 1;
      continue;
    }
    if (!init[key].type) {
      init[key].type = "boolean";
    }

    // deno-lint-ignore valid-typeof
    if (typeof value != init[key].type) {
      index += 1;
      continue;
    }
    if (typeof value != "boolean" || !init[key].children) {
      result[key] = value;
      index += 1;
      continue;
    }

    const childInit = init[key].children;
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
        tempIndex -= 1;
        break;
      }
      temp[key] = value;
    }
    if (Object.entries(temp).length == 0) {
      result[key] = true;
    } else {
      result[key] = temp;
    }
    index = tempIndex + 1;
  }
  return result as ExtractArgs<T>;
}
