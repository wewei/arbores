// Enum and constant testing
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest"
}

export const enum Color {
  RED = "#ff0000",
  GREEN = "#00ff00",
  BLUE = "#0000ff"
}

export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3,
  debug: false
} as const;

export type Config = typeof DEFAULT_CONFIG;
