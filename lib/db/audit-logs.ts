// Database helper functions for Audit Logs
import { convexClient, api } from '@/lib/convex/server'
import type { AuditLog } from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertAuditLog(doc: any): AuditLog | null {
  if (!doc) return null;
  return {
    id: doc._id,
    ferry_flight_id: doc.ferryFlightId || null,
    user_id: doc.userId || null,
    action: doc.action,
    entity_type: doc.entityType || null,
    entity_id: doc.entityId || null,
    changes: doc.changes || null,
    created_at: new Date(doc.createdAt).toISOString(),
  };
}

export async function getAuditLogsByFlight(flightId: string): Promise<AuditLog[]> {
  try {
    const results = await convexClient.query(api["queries/auditLogs"].getAuditLogsByFlight, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results.map(convertAuditLog).filter((log): log is AuditLog => log !== null);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

export async function getStatusHistory(flightId: string): Promise<AuditLog[]> {
  try {
    const results = await convexClient.query(api["queries/auditLogs"].getStatusHistory, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results.map(convertAuditLog).filter((log): log is AuditLog => log !== null);
  } catch (error) {
    console.error('Error fetching status history:', error);
    return [];
  }
}
