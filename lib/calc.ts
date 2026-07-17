/**
 * Self-contained scientific expression evaluator — no `eval`, no dependencies.
 *
 * Pipeline: tokenize → inject implicit multiplication → shunting-yard to RPN →
 * evaluate RPN. Supports + - * / % ^, unary minus, factorial (!), parentheses,
 * constants (pi/e/tau) and common functions. Trig respects `degrees` mode.
 */

type TokType = "num" | "const" | "func" | "op" | "lparen" | "rparen";
type Token = { type: TokType; value: string };

/**
 * Evaluation failure carrying a message *key* (plus optional values) instead of
 * prose, so the UI can render it in the active locale. Keys map to the
 * `calculatorPage.errors` namespace in the message catalogues.
 */
export class CalcError extends Error {
  constructor(
    public readonly key:
      | "badNumber"
      | "unknownName"
      | "badChar"
      | "parens"
      | "factorial"
      | "incomplete"
      | "invalid"
      | "empty"
      | "notFinite",
    public readonly values?: Record<string, string>,
  ) {
    super(key);
    this.name = "CalcError";
  }
}

const FUNCS = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan",
  "sinh", "cosh", "tanh",
  "sqrt", "cbrt", "ln", "log", "log2", "exp",
  "abs", "sign", "floor", "ceil", "round",
]);

const CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

// Binary/prefix operators: [precedence, right-associative].
const OPS: Record<string, [number, boolean]> = {
  "+": [2, false],
  "-": [2, false],
  "*": [3, false],
  "/": [3, false],
  "%": [3, false],
  // Unary minus sits between multiplication and power, and as a *prefix* operator
  // it never pops anything on the way in. Together this gives the conventional
  // -3^2 = -(3^2) = -9, while still allowing 2^-2 = 0.25.
  "u-": [3.5, true],
  "^": [4, true],
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = input.trim();

  while (i < src.length) {
    const c = src[i];

    if (c === " ") {
      i++;
      continue;
    }
    // Number (with optional decimal part).
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      if ((num.match(/\./g) || []).length > 1) {
        throw new CalcError("badNumber", { value: num });
      }
      tokens.push({ type: "num", value: num });
      continue;
    }
    // Identifier: function or constant.
    if (/[a-zA-Z]/.test(c)) {
      let name = "";
      while (i < src.length && /[a-zA-Z0-9]/.test(src[i])) name += src[i++];
      const lower = name.toLowerCase();
      if (FUNCS.has(lower)) tokens.push({ type: "func", value: lower });
      else if (lower in CONSTS) tokens.push({ type: "const", value: lower });
      else throw new CalcError("unknownName", { value: name });
      continue;
    }
    if (c === "(") {
      tokens.push({ type: "lparen", value: c });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c });
      i++;
      continue;
    }
    if ("+-*/%^!".includes(c)) {
      // Distinguish unary minus from subtraction by looking at the previous token.
      if (c === "-") {
        const prev = tokens[tokens.length - 1];
        const isUnary =
          !prev ||
          prev.type === "op" ||
          prev.type === "lparen" ||
          prev.type === "func";
        tokens.push({ type: "op", value: isUnary ? "u-" : "-" });
      } else if (c === "+") {
        const prev = tokens[tokens.length - 1];
        // Drop a leading/unary plus entirely.
        if (prev && (prev.type === "num" || prev.type === "const" || prev.type === "rparen")) {
          tokens.push({ type: "op", value: "+" });
        }
      } else {
        tokens.push({ type: "op", value: c });
      }
      i++;
      continue;
    }
    throw new CalcError("badChar", { value: c });
  }

  return injectImplicitMultiply(tokens);
}

/** Insert `*` between adjacent values, e.g. 2π, 2(3+1), (1)(2), 3sin(x). */
function injectImplicitMultiply(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const prev = out[out.length - 1];
    const cur = tokens[i];
    const prevIsValue =
      prev && (prev.type === "num" || prev.type === "const" || prev.type === "rparen");
    const curStartsValue =
      cur.type === "num" ||
      cur.type === "const" ||
      cur.type === "func" ||
      cur.type === "lparen";
    if (prevIsValue && curStartsValue) {
      out.push({ type: "op", value: "*" });
    }
    out.push(cur);
  }
  return out;
}

/** Shunting-yard: token stream → Reverse Polish Notation. */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const tok of tokens) {
    switch (tok.type) {
      case "num":
      case "const":
        output.push(tok);
        break;
      case "func":
        stack.push(tok);
        break;
      case "op": {
        if (tok.value === "!") {
          // Postfix: binds tightest, emit immediately.
          output.push(tok);
          break;
        }
        if (tok.value === "u-") {
          // Prefix: applies to what follows, so never pop on the way in.
          stack.push(tok);
          break;
        }
        const [prec, rightAssoc] = OPS[tok.value];
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.type === "func") {
            output.push(stack.pop()!);
            continue;
          }
          if (top.type === "op") {
            const [topPrec] = OPS[top.value];
            if (topPrec > prec || (topPrec === prec && !rightAssoc)) {
              output.push(stack.pop()!);
              continue;
            }
          }
          break;
        }
        stack.push(tok);
        break;
      }
      case "lparen":
        stack.push(tok);
        break;
      case "rparen": {
        let found = false;
        while (stack.length) {
          const top = stack.pop()!;
          if (top.type === "lparen") {
            found = true;
            break;
          }
          output.push(top);
        }
        if (!found) throw new CalcError("parens");
        if (stack.length && stack[stack.length - 1].type === "func") {
          output.push(stack.pop()!);
        }
        break;
      }
    }
  }

  while (stack.length) {
    const top = stack.pop()!;
    if (top.type === "lparen") throw new CalcError("parens");
    output.push(top);
  }
  return output;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new CalcError("factorial");
  let result = 1;
  for (let k = 2; k <= n; k++) result *= k;
  return result;
}

function applyFunc(name: string, x: number, degrees: boolean): number {
  const toRad = (v: number) => (degrees ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) => (degrees ? (v * 180) / Math.PI : v);
  switch (name) {
    case "sin": return Math.sin(toRad(x));
    case "cos": return Math.cos(toRad(x));
    case "tan": return Math.tan(toRad(x));
    case "asin": return fromRad(Math.asin(x));
    case "acos": return fromRad(Math.acos(x));
    case "atan": return fromRad(Math.atan(x));
    case "sinh": return Math.sinh(x);
    case "cosh": return Math.cosh(x);
    case "tanh": return Math.tanh(x);
    case "sqrt": return Math.sqrt(x);
    case "cbrt": return Math.cbrt(x);
    case "ln": return Math.log(x);
    case "log": return Math.log10(x);
    case "log2": return Math.log2(x);
    case "exp": return Math.exp(x);
    case "abs": return Math.abs(x);
    case "sign": return Math.sign(x);
    case "floor": return Math.floor(x);
    case "ceil": return Math.ceil(x);
    case "round": return Math.round(x);
    default: throw new CalcError("unknownName", { value: name });
  }
}

function evalRPN(rpn: Token[], degrees: boolean): number {
  const stack: number[] = [];
  for (const tok of rpn) {
    if (tok.type === "num") {
      stack.push(Number(tok.value));
    } else if (tok.type === "const") {
      stack.push(CONSTS[tok.value]);
    } else if (tok.type === "func") {
      if (!stack.length) throw new CalcError("incomplete");
      stack.push(applyFunc(tok.value, stack.pop()!, degrees));
    } else if (tok.type === "op") {
      if (tok.value === "u-") {
        if (!stack.length) throw new CalcError("incomplete");
        stack.push(-stack.pop()!);
      } else if (tok.value === "!") {
        if (!stack.length) throw new CalcError("incomplete");
        stack.push(factorial(stack.pop()!));
      } else {
        if (stack.length < 2) throw new CalcError("incomplete");
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (tok.value) {
          case "+": stack.push(a + b); break;
          case "-": stack.push(a - b); break;
          case "*": stack.push(a * b); break;
          case "/": stack.push(a / b); break;
          case "%": stack.push(a % b); break;
          case "^": stack.push(a ** b); break;
        }
      }
    }
  }
  if (stack.length !== 1) throw new CalcError("invalid");
  return stack[0];
}

/** Evaluate a scientific expression. Throws Error with a Chinese message on failure. */
export function evaluate(input: string, degrees = false): number {
  if (!input.trim()) throw new CalcError("empty");
  const result = evalRPN(toRPN(tokenize(input)), degrees);
  if (!Number.isFinite(result)) {
    throw new CalcError("notFinite");
  }
  return result;
}
