import { NextRequest, NextResponse } from 'next/server';

// Test database connection details
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Check for common issues
  const issues: string[] = [];
  
  if (!databaseUrl) {
    issues.push('DATABASE_URL not set');
  } else {
    // Check format
    if (!databaseUrl.startsWith('postgresql://')) {
      issues.push('Invalid protocol (should be postgresql://)');
    }
    
    // Check for special chars in password
    const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/);
    if (urlMatch) {
      const password = urlMatch[2];
      if (password.includes('@') || password.includes('/') || password.includes(':')) {
        issues.push('Password contains special characters - needs URL encoding');
      }
    }
    
    // Check port
    const portMatch = databaseUrl.match(/:(\d+)\/?/);
    if (!portMatch || isNaN(parseInt(portMatch[1]))) {
      issues.push('Invalid port number');
    }
  }
  
  return NextResponse.json({
    status: databaseUrl ? 'present' : 'missing',
    hasProtocol: databaseUrl?.startsWith('postgresql://') ? '✅' : '❌',
    hasPort: !!databaseUrl?.match(/:\d+\//) ? '✅' : '❌',
    issues: issues,
    urlPreview: databaseUrl ? `${databaseUrl.substring(0, 20)}...` : 'N/A'
  });
}
