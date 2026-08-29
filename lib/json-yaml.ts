import { parseAllDocuments, stringify } from "yaml";

export type JsonYamlErrorKey =
  | "invalidJson"
  | "invalidYaml"
  | "multipleDocs"
  | "unsupported";

export class JsonYamlError extends Error {
  key: JsonYamlErrorKey;
  values: Record<string, string | number>;

  constructor(key: JsonYamlErrorKey, values: Record<string, string | number> = {}) {
    super(key);
    this.name = "JsonYamlError";
    this.key = key;
    this.values = values;
  }
}

function firstLine(message: string): string {
  return message.split("\n")[0] || message;
}

export function jsonToYaml(input: string, indent: 2 | 4 = 2): string {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (err) {
    throw new JsonYamlError("invalidJson", {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    return stringify(value, null, { indent, lineWidth: 0 });
  } catch (err) {
    throw new JsonYamlError("unsupported", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export function yamlToJson(input: string, indent: 2 | 4 = 2): string {
  const docs = parseAllDocuments(input);
  if (docs.length > 1) {
    throw new JsonYamlError("multipleDocs");
  }

  const doc = docs[0];
  if (doc.errors.length > 0) {
    throw new JsonYamlError("invalidYaml", {
      message: firstLine(doc.errors[0].message),
    });
  }

  try {
    return JSON.stringify(doc.toJSON(), null, indent);
  } catch (err) {
    throw new JsonYamlError("unsupported", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
