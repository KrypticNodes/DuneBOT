import { type User, type InsertUser, type Transaction, type Alert } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  addTransaction(tx: Transaction): void;
  getTransactionsByWallet(address: string): Transaction[];
  getAllTransactions(): Transaction[];
  
  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>): Alert;
  getAlertsByWallet(address: string): Alert[];
  getAllAlerts(): Alert[];
  markAlertAsRead(id: string): void;
  deleteAlert(id: string): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private transactionsByWallet: Map<string, string[]> = new Map();

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  addTransaction(tx: Transaction): void {
    this.transactions.set(tx.id, tx);
    
    // Index by wallet for quick lookups
    const wallets = [tx.sourceAddress, tx.destinationAddress].filter(addr => addr !== 'Unknown' && addr !== 'DEX/Transfer');
    
    for (const wallet of wallets) {
      if (!this.transactionsByWallet.has(wallet)) {
        this.transactionsByWallet.set(wallet, []);
      }
      const txList = this.transactionsByWallet.get(wallet)!;
      if (!txList.includes(tx.id)) {
        txList.unshift(tx.id); // Add to beginning for recent-first order
        
        // Keep only last 100 transactions per wallet to prevent memory issues
        if (txList.length > 100) {
          txList.pop();
        }
      }
    }
  }

  getTransactionsByWallet(address: string): Transaction[] {
    const txIds = this.transactionsByWallet.get(address) || [];
    return txIds
      .map(id => this.transactions.get(id))
      .filter((tx): tx is Transaction => tx !== undefined);
  }

  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100); // Return most recent 100
  }

  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>): Alert {
    const id = randomUUID();
    const newAlert: Alert = {
      ...alert,
      id,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.alerts.set(id, newAlert);
    
    // Keep only last 200 alerts to prevent memory issues
    if (this.alerts.size > 200) {
      const alertKeys = Array.from(this.alerts.keys());
      const oldestId = alertKeys[0];
      this.alerts.delete(oldestId);
    }
    
    return newAlert;
  }

  getAlertsByWallet(address: string): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.walletAddress === address)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  markAlertAsRead(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
    }
  }

  deleteAlert(id: string): void {
    this.alerts.delete(id);
  }
}

export const storage = new MemStorage();
