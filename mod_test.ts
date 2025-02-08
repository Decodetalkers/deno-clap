import { assertEquals } from "@std/assert";
import { type Command, parseCliArgs } from "./mod.ts";

const ClapTemplate = {
  run: {
    description: "run the program",
    children: {
      tcp: {
        description: "with tcp",
        children: {
          reconnection: {
            description: "reconnection",
            type: "boolean",
            default: true,
          },
          port: {
            description: "set the port",
            default: 8000,
            type: "number",
          },
        },
      },
      udp: {
        description: "with udp",
        type: "number",
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
    ["--run", "--tcp", "--port", "9000"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, {
    run: { tcp: { port: 9000, reconnection: true } },
  });
});

Deno.test(function addTest2() {
  const result = parseCliArgs(
    ["--run", "--tcp"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, {
    run: { tcp: { port: 8000, reconnection: true } },
  });
});

Deno.test(function addTest3() {
  const result = parseCliArgs(
    ["--run", "--udp", "8000"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, {
    run: { udp: 8000 },
  });
});

Deno.test(function addTest4() {
  const result = parseCliArgs(
    ["--run", "--udp"],
    ClapTemplate,
    cmd,
  );
  assertEquals(result, {
    run: {},
  });
});

Deno.test(function addTest5() {
  const result1 = parseCliArgs(
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
