export const ValidationMessage = {
  Type: (
    name: string,
    type: "string",
    // | "nan"
    // | "number"
    // | "integer"
    // | "float"
    // | "boolean"
    // | "date"
    // | "bigint"
    // | "symbol"
    // | "function"
    // | "undefined"
    // | "null"
    // | "array"
    // | "object"
    // | "unknown"
    // | "promise"
    // | "void"
    // | "never"
    // | "map"
    // | "set",
  ) => {
    switch (typeof type) {
      default:
        return `${name} harus dalam bentuk string.`;
    }
  },
  Require: (name: string) => {
    return `${name} harus diisi.`;
  },
  Email: (name: string) => {
    return `${name} tidak dapat digunakan.`;
  },
  Min: (name: string, number: number) => {
    return `${name} terlalu pendek. Minimal ${number} Karakter.`;
  },
  Max: (name: string, number: number) => {
    return `${name} terlalu panjang. Maksimal ${number} Karakter.`;
  },
} as const;
