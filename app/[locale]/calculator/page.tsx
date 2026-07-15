"use client";

import { useMemo, useState } from "react";
import ToolLayout, { ToolPanel } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { evaluate } from "@/lib/calc";

type Btn = {
  label: string;
  /** Text inserted into the expression; omit for action buttons. */
  insert?: string;
  /** Visual kind for styling. */
  kind?: "num" | "op" | "fn" | "ctrl";
};

const ROWS: Btn[][] = [
  [
    { label: "AC", kind: "ctrl" },
    { label: "⌫", kind: "ctrl" },
    { label: "(", insert: "(", kind: "op" },
    { label: ")", insert: ")", kind: "op" },
    { label: "^", insert: "^", kind: "op" },
  ],
  [
    { label: "sin", insert: "sin(", kind: "fn" },
    { label: "cos", insert: "cos(", kind: "fn" },
    { label: "tan", insert: "tan(", kind: "fn" },
    { label: "ln", insert: "ln(", kind: "fn" },
    { label: "log", insert: "log(", kind: "fn" },
  ],
  [
    { label: "√", insert: "sqrt(", kind: "fn" },
    { label: "π", insert: "pi", kind: "fn" },
    { label: "e", insert: "e", kind: "fn" },
    { label: "n!", insert: "!", kind: "op" },
    { label: "%", insert: "%", kind: "op" },
  ],
  [
    { label: "7", insert: "7", kind: "num" },
    { label: "8", insert: "8", kind: "num" },
    { label: "9", insert: "9", kind: "num" },
    { label: "÷", insert: "/", kind: "op" },
    { label: "×", insert: "*", kind: "op" },
  ],
  [
    { label: "4", insert: "4", kind: "num" },
    { label: "5", insert: "5", kind: "num" },
    { label: "6", insert: "6", kind: "num" },
    { label: "−", insert: "-", kind: "op" },
    { label: "+", insert: "+", kind: "op" },
  ],
  [
    { label: "1", insert: "1", kind: "num" },
    { label: "2", insert: "2", kind: "num" },
    { label: "3", insert: "3", kind: "num" },
    { label: "0", insert: "0", kind: "num" },
    { label: ".", insert: ".", kind: "num" },
  ],
];

/** Format a result: trim floating-point noise, keep it readable. */
function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // toPrecision(12) then drop trailing zeros to hide binary rounding artifacts.
  return String(Number(n.toPrecision(12)));
}

function buttonClass(kind: Btn["kind"]): string {
  switch (kind) {
    case "num":
      return "bg-foreground/5 hover:bg-foreground/10 text-foreground";
    case "op":
      return "bg-foreground/10 hover:bg-foreground/15 text-foreground";
    case "fn":
      return "bg-foreground/5 hover:bg-foreground/10 text-foreground/80 text-sm";
    case "ctrl":
      return "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400";
    default:
      return "";
  }
}

export default function CalculatorPage() {
  const [expr, setExpr] = useState("");
  const [degrees, setDegrees] = useState(false);

  const { result, error } = useMemo(() => {
    if (!expr.trim()) return { result: "", error: "" };
    try {
      return { result: formatResult(evaluate(expr, degrees)), error: "" };
    } catch (e) {
      return { result: "", error: e instanceof Error ? e.message : "表达式无效。" };
    }
  }, [expr, degrees]);

  function press(btn: Btn) {
    if (btn.label === "AC") {
      setExpr("");
      return;
    }
    if (btn.label === "⌫") {
      setExpr((s) => s.slice(0, -1));
      return;
    }
    if (btn.insert != null) setExpr((s) => s + btn.insert);
  }

  return (
    <ToolLayout
      title="科学计算器"
      description="支持基本运算与常见科学函数(三角、对数、幂、阶乘等)。所有计算在浏览器本地完成。"
      icon="🧮"
    >
      {/* Angle mode */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">三角函数角度单位</span>
        <div className="inline-flex rounded-lg border border-border p-1">
          {(
            [
              [false, "弧度 RAD"],
              [true, "角度 DEG"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setDegrees(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                degrees === value
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expression + result display */}
      <ToolPanel>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="输入或点击下方按钮,例如 sin(30)+2^3"
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 text-right font-mono text-lg outline-none focus:border-emerald-500"
        />
        <div className="mt-3 flex min-h-8 items-center justify-between gap-3">
          {error ? (
            <span className="text-sm text-muted">{expr.trim() ? error : ""}</span>
          ) : (
            <span className="font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {result && `= ${result}`}
            </span>
          )}
          <CopyButton value={result} className="shrink-0" />
        </div>
      </ToolPanel>

      {/* Button pad */}
      <div className="grid grid-cols-5 gap-2">
        {ROWS.flat().map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(btn)}
            className={`rounded-lg py-3 text-base font-medium transition ${buttonClass(
              btn.kind,
            )}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">
        支持函数:sin cos tan asin acos atan sqrt cbrt ln log log2 exp abs floor
        ceil round,常量 pi/e/tau,以及隐式乘法(如 2π、3(4+1))。
      </p>
    </ToolLayout>
  );
}
