export interface InventoryStats {
  totalBreakfastAvailable: number;
  totalLunchAvailable: number;
  totalServed: number;
  totalBreakfastServed: number;
  totalLunchServed: number;
  totalParticipants: number;
  duplicateScans: number;
  invalidTickets: number;
  percentageClaimed: number;
  breakfastPercentageClaimed: number;
  lunchPercentageClaimed: number;
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
