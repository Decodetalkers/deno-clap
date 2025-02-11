/**
 * @module
 * This file describe the style that clap use
 *
 * @example
 * ```typescript
 * import { GlobalStyle } from "@nobody/deno-clap";
 * GlobalStyle.setLiteral(brightGreen);
 * GlobalStyle.setHeader(yellow);
 * ```
 */
import { brightYellow, green } from "@std/fmt/colors";

/**
 * The function describe the display way of information
 */
export interface PrintFun {
  (info: string): string;
}

/**
 * Now support to change the style of header and literal
 */
export type DisplayPlace = "header" | "literal";

class PrintSetting {
  private _header: PrintFun = brightYellow;
  private _literal: PrintFun = green;
  constructor() {}

  /**
   * The display way of header,
   * header is, for example, `Usage:`
   * default is brightYellow
   */
  get header(): PrintFun {
    return this._header;
  }

  /**
   * The display way of literal
   * literal is, for example, '--port'.
   */
  get literal(): PrintFun {
    return this._literal;
  }

  /**
   * Set the show way of header
   * @param fn way to display style
   */
  setHeader(fn: PrintFun) {
    this._header = fn;
  }

  /**
   * Set the show way of literal
   * @param fn way to display style
   */
  setLiteral(fn: PrintFun) {
    this._literal = fn;
  }

  /**
   * Choose which style to set
   * @param fn way to display style
   * @param place the place to change
   */
  setStyle(fn: PrintFun, place: DisplayPlace) {
    switch (place) {
      case "literal":
        this._literal = fn;
        return;
      case "header":
        this._header = fn;
        return;
    }
  }
}

/**
 * GlobalStyle, which the clap uses.
 */
const GlobalStyle = new PrintSetting();

export default GlobalStyle;
