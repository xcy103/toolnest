import type { JsonValue } from "./json-flat.ts";

export const JSON_PATH_LIMITS = { characters: 2_000_000, depth: 100, nodes: 5_000 };

export type JsonPathErrorKey = "syntax" | "tooLarge" | "tooDeep" | "tooMany";
export type JsonNodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

export class JsonPathError extends Error {
  key: JsonPathErrorKey;

  constructor(key: JsonPathErrorKey) {
    super(key);
    this.key = key;
  }
}

export type JsonTreeNode = {
  pointer: string;
  label: string;
  key: string | null;
  type: JsonNodeType;
  value: JsonValue;
  children: JsonTreeNode[];
};

function escapeToken(token: string): string {
  return token.replaceAll("~", "~0").replaceAll("/", "~1");
}

function valueType(value: JsonValue): JsonNodeType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return typeof value as "string" | "number" | "boolean";
}

export function parseJsonTree(text: string): { root: JsonTreeNode; count: number } {
  if (text.length > JSON_PATH_LIMITS.characters) throw new JsonPathError("tooLarge");
  let value: JsonValue;
  try {
    value = JSON.parse(text) as JsonValue;
  } catch {
    throw new JsonPathError("syntax");
  }

  let count = 0;
  const build = (current: JsonValue, pointer: string, label: string, key: string | null, depth: number): JsonTreeNode => {
    if (depth > JSON_PATH_LIMITS.depth) throw new JsonPathError("tooDeep");
    if (count === JSON_PATH_LIMITS.nodes) throw new JsonPathError("tooMany");
    count += 1;
    const children: JsonTreeNode[] = [];
    if (Array.isArray(current)) {
      current.forEach((child, index) => children.push(build(child, `${pointer}/${index}`, `[${index}]`, null, depth + 1)));
    } else if (current !== null && typeof current === "object") {
      for (const [childKey, child] of Object.entries(current)) {
        children.push(build(child, `${pointer}/${escapeToken(childKey)}`, childKey, childKey, depth + 1));
      }
    }
    return { pointer, label, key, type: valueType(current), value: current, children };
  };

  return { root: build(value, "", "$", null, 0), count };
}

export function searchJsonTree(root: JsonTreeNode, query: string): { visible: Set<string>; matches: number } {
  const needle = query.trim().toLocaleLowerCase();
  const visible = new Set<string>();
  let matches = 0;
  if (!needle) return { visible, matches };

  const visit = (node: JsonTreeNode): boolean => {
    const ownMatch = node.key !== null && node.key.toLocaleLowerCase().includes(needle);
    let descendantMatch = false;
    for (const child of node.children) descendantMatch = visit(child) || descendantMatch;
    if (ownMatch) matches += 1;
    if (ownMatch || descendantMatch) visible.add(node.pointer);
    return ownMatch || descendantMatch;
  };
  visit(root);
  return { visible, matches };
}

export function collectContainerPointers(root: JsonTreeNode): Set<string> {
  const pointers = new Set<string>();
  const visit = (node: JsonTreeNode) => {
    if (node.children.length) {
      pointers.add(node.pointer);
      node.children.forEach(visit);
    }
  };
  visit(root);
  return pointers;
}

export function findJsonNode(root: JsonTreeNode, pointer: string): JsonTreeNode | null {
  if (root.pointer === pointer) return root;
  for (const child of root.children) {
    const match = findJsonNode(child, pointer);
    if (match) return match;
  }
  return null;
}

export function nodePreview(node: JsonTreeNode, maxLength = 80): string {
  if (node.type === "object") return `{${node.children.length}}`;
  if (node.type === "array") return `[${node.children.length}]`;
  const serialized = JSON.stringify(node.value);
  return serialized.length > maxLength ? `${serialized.slice(0, maxLength - 1)}…` : serialized;
}

export function nodeValueText(node: JsonTreeNode): string {
  return JSON.stringify(node.value, null, 2);
}
