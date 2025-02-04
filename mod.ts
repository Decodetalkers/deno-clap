export type Command = {
  name: string;
  author?: string;
};

export interface Clap {
  name: string;
  author: string;
}

interface BaseClap {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): // deno-lint-ignore ban-types
  {};
}

export function command<T extends BaseClap>({ name, author }: Command) {
  return function (Base: T) {
    return class extends Base implements Clap {
      name = name;
      author = author || "nobody";
    };
  };
}

export function ignore() {
  return function (
    // deno-lint-ignore no-explicit-any
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    descriptor.enumerable = false;
  };
}

@command({ name: "abcefg", author: "helloworld" })
class ABC {
}

export function add(a: number, b: number): number {
  return a + b;
}
