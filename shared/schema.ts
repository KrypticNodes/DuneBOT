import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface WalletMonitor {
  id: string;
  address: string;
  nickname: string;
  balance: number;
  lastActivity: string;
  alertCount: number;
  isActive: boolean;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  signature: string;
  timestamp: string;
  type: 'buy' | 'sell' | 'transfer' | 'mint';
  tokenMint: string;
  tokenName: string;
  amount: number;
  sourceAddress: string;
  destinationAddress: string;
  status: 'confirmed' | 'pending' | 'failed';
  isNewMint: boolean;
}

export interface FundingWallet {
  id: string;
  address: string;
  confidence: number;
  totalFunded: number;
  lastFunding: string;
  sniperWalletsCount: number;
  recentTransactions: Transaction[];
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'new_mint' | 'funding_detected' | 'unusual_activity';
  walletAddress: string;
  tokenMint?: string;
  tokenName?: string;
  message: string;
  isRead: boolean;
}

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  createdAt: string;
  firstDetectedAt: string;
  detectedInWallets: string[];
}
