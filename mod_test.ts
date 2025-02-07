import { assertEquals } from "@std/assert";
import { parseCliArgs } from "./mod.ts";

const ClapTemplate = {
  run: {
    description: "run the program",
    default: true,
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

Deno.test(function addTest() {
  const result = parseCliArgs(
    ["--run", "--tcp", "9000"],
    ClapTemplate,
  );
  assertEquals(result, { run: { tcp: 9000 } });
});

Deno.test(function addTest2() {
  const result = parseCliArgs(
    ["--run"],
    ClapTemplate,
  );
  assertEquals(result, { run: {} });
});

Deno.test(function addTest3() {
  const result = parseCliArgs(
    [],
    ClapTemplate,
  );
  assertEquals(result, {});
});
