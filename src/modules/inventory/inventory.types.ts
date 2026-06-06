export interface InventoryStats {
  totalAvailable: number;
  totalServed: number;
  totalParticipants: number;
  duplicateScans: number;
  invalidTickets: number;
  percentageClaimed: number;
}

export interface SystemHealth {
  database: {
    status: "up" | "down";
    latencyMs: number;
  };
  memory: {
    heapUsedMB: number;
  };
  uptime: number;
  version: string;
}
