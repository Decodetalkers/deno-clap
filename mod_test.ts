import { assertEquals } from "@std/assert";
import { type Command, parseCliArgs } from "./mod.ts";

const ClapTemplate = {
  run: {
    description: "run the program",
    children: {
      tcp: {
        description: "with tcp",
        type: "number",
        default: 1000,
      },
      udp: {
        description: "with udp",
        type: "number",
        default: 1000,
      },
    },
  },
} as const;

const cmd: Command = {
  exeName: "run",
  description: "it is an example",
  version: "0.1.0",
};

Deno.test(function addTest() {
  const result = parseCliArgs(
    ["--run", "--tcp", "9000"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, { run: { tcp: 9000, udp: 1000 } });
});

Deno.test(function addTest2() {
  const result = parseCliArgs(
    ["--run"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, { run: { tcp: 1000, udp: 1000 } });
});

Deno.test(function addTest3() {
  const result1 =parseCliArgs(
    [],
    ClapTemplate,
    cmd,
  );
  assertEquals(result1, undefined);
  const result2 = parseCliArgs(
    ["--version"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result2, undefined);
  const result3 = parseCliArgs(
    ["--run", "--help"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result3, undefined);
});
