/**
 * Security event logger for monitoring suspicious activity.
 * In production, integrate with a proper logging service (Datadog, Sentry, etc.)
 */

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'SIGNUP_SUCCESS'
  | 'RATE_LIMIT_HIT'
  | 'UNAUTHORIZED_ACCESS'
  | 'IDOR_ATTEMPT'
  | 'API_ERROR'
  | 'UNUSUAL_TRAFFIC'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'EMAIL_VERIFIED'
  | 'ANSWER_ACCEPTED'
  | 'PASSWORD_CHANGED';

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip?: string;
  path?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const MAX_EVENTS_IN_MEMORY = 1000;
const eventLog: SecurityEvent[] = [];

export function logSecurityEvent(
  type: SecurityEventType,
  options?: {
    userId?: string;
    email?: string;
    ip?: string;
    path?: string;
    details?: Record<string, unknown>;
  }
): void {
  const event: SecurityEvent = {
    type,
    ...options,
    timestamp: new Date().toISOString(),
  };

  eventLog.push(event);

  // Trim old events if memory gets too large
  if (eventLog.length > MAX_EVENTS_IN_MEMORY) {
    eventLog.splice(0, eventLog.length - MAX_EVENTS_IN_MEMORY);
  }

  // Log to console with structured format for production logging pipelines
  const logLine = JSON.stringify(event);
  switch (type) {
    case 'API_ERROR':
    case 'IDOR_ATTEMPT':
    case 'UNAUTHORIZED_ACCESS':
    case 'RATE_LIMIT_HIT':
      console.warn(`[SECURITY] ${logLine}`);
      break;
    case 'LOGIN_FAILURE':
      console.warn(`[SECURITY] ${logLine}`);
      break;
    default:
      console.info(`[SECURITY] ${logLine}`);
      break;
  }
}

export function getRecentSecurityEvents(minutes = 60): SecurityEvent[] {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return eventLog.filter(
    (e) => new Date(e.timestamp).getTime() > cutoff
  );
}

export function getSecurityEventStats(hours = 24): Record<SecurityEventType, number> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const stats: Record<string, number> = {};

  for (const event of eventLog) {
    if (new Date(event.timestamp).getTime() > cutoff) {
      stats[event.type] = (stats[event.type] || 0) + 1;
    }
  }

  return stats as Record<SecurityEventType, number>;
}