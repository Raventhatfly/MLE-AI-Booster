import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "./generated/prisma/client";

/**
 * Prisma client 单例。
 *
 * 三条约束（见 README「运行形态」一节）：
 *   1. 懒加载 —— 只有真正查询时才建连接。模块顶层不能 new PrismaClient()，
 *      否则云端（无 DATABASE_URL）一 import 就炸。
 *   2. hasDatabase() 是本地/云端的唯一开关：有 DATABASE_URL 走数据库，
 *      没有则由 lib/data.ts 降级到只读种子数据。
 *   3. dev 环境下把实例挂在 globalThis 上，避免 Next.js 热重载反复建连接
 *      导致 SQLite 句柄泄漏。
 */

/** 当前环境是否配置了数据库。云端刻意不配这个变量。 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cached: PrismaClient | undefined;

/**
 * 取得 Prisma client。调用前必须先用 hasDatabase() 判断，
 * 未配置 DATABASE_URL 时调用会抛错 —— 这是刻意的，避免静默连到错误的库。
 */
export function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 未配置。调用 getPrisma() 前请先用 hasDatabase() 判断，" +
        "云端形态应走 lib/data.ts 的种子数据降级路径。",
    );
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (cached) return cached;

  const adapter = new PrismaBetterSqlite3({ url });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  cached = client;
  return client;
}

/** SQLite 无标量数组，followUps 以 JSON 字符串存储 —— 读写都走这两个函数。 */
export function serializeFollowUps(followUps: string[]): string {
  return JSON.stringify(followUps);
}

export function parseFollowUps(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
