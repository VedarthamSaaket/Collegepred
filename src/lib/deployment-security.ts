/**
 * Deployment Security Configuration
 * 
 * This module provides security configuration for production deployment.
 * Run `npx ts-node src/lib/deployment-security.ts` to validate your setup.
 */

export interface SecurityConfig {
  https: {
    enabled: boolean;
    enforceHSTS: boolean;
    hstsMaxAge: number;
  };
  database: {
    directPublicAccessAllowed: boolean;
  };
  secrets: {
    envVarKeys: string[];
    ensureNoHardcodedSecrets: boolean;
  };
  monitoring: {
    logAuthAttempts: boolean;
    logAPIErrors: boolean;
    detectUnusualTraffic: boolean;
    alertOnSuspiciousActivity: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    endpoints: string[];
  };
}

export const PRODUCTION_SECURITY_CONFIG: SecurityConfig = {
  https: {
    enabled: true,
    enforceHSTS: true,
    hstsMaxAge: 31536000, // 1 year in seconds
  },
  database: {
    directPublicAccessAllowed: false,
  },
  secrets: {
    envVarKeys: [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'RESEND_API_KEY',
      'NEXT_PUBLIC_APP_URL',
      'ENCRYPTION_KEY',
    ],
    ensureNoHardcodedSecrets: true,
  },
  monitoring: {
    logAuthAttempts: true,
    logAPIErrors: true,
    detectUnusualTraffic: true,
    alertOnSuspiciousActivity: true,
  },
  rateLimiting: {
    enabled: true,
    endpoints: [
      '/api/auth/signup',
      '/api/auth/login',
      '/api/predict',
      '/api/discuss',
      '/api/discuss/*/answers',
      '/api/saved',
      '/api/compare',
    ],
  },
};

/**
 * Validate that the current environment meets security requirements.
 * Returns a list of warnings for any issues found.
 */
export function validateDeploymentSecurity(): string[] {
  const warnings: string[] = [];

  // Check required environment variables
  for (const key of PRODUCTION_SECURITY_CONFIG.secrets.envVarKeys) {
    if (!key.startsWith('NEXT_PUBLIC_') && !process.env[key]) {
      warnings.push(`Missing required environment variable: ${key}`);
    }
  }

  // Check if NEXTAUTH_URL uses HTTPS in production
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && nextAuthUrl.startsWith('http://')) {
    warnings.push('NEXTAUTH_URL should use HTTPS in production');
  }

  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    warnings.push('DATABASE_URL is not set');
  } else if (dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    warnings.push('DATABASE_URL should use postgresql:// scheme');
  }

  return warnings;
}

/**
 * Log security configuration status at startup.
 */
export function logDeploymentStatus(): void {
  console.log('[SECURITY] Validating deployment security...');
  const warnings = validateDeploymentSecurity();

  if (warnings.length === 0) {
    console.log('[SECURITY] ✅ All security checks passed');
  } else {
    for (const warning of warnings) {
      console.warn(`[SECURITY] ⚠️  ${warning}`);
    }
  }

  console.log('[SECURITY] HTTPS enforced:', PRODUCTION_SECURITY_CONFIG.https.enabled);
  console.log('[SECURITY] Rate limiting:', PRODUCTION_SECURITY_CONFIG.rateLimiting.enabled);
  console.log('[SECURITY] Monitoring:', Object.values(PRODUCTION_SECURITY_CONFIG.monitoring).every(Boolean));
}

// Auto-run validation in production
if (process.env.NODE_ENV === 'production') {
  logDeploymentStatus();
}