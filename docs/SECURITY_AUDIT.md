# Security Audit Report - MTGV Application

**Date**: February 25, 2026
**Version**: 1.0
**Scope**: Backend API and Frontend Web Application

---

## Executive Summary

This security audit covers the MTGV (Magic: The Gathering Versioner) application, consisting of a Node.js/Express backend API and a Next.js frontend application. The audit evaluates common web security vulnerabilities and provides recommendations for improvement.

**Overall Security Rating**: 🟡 MODERATE (Acceptable for MVP, needs improvement for production)

**Critical Findings**: 0
**High Priority**: 2
**Medium Priority**: 4
**Low Priority**: 3

---

## 1. Input Validation & Sanitization

### Status: 🟢 GOOD

**Findings**:

- ✅ Input validation middleware exists (`validateParams.js`)
- ✅ Card names are sanitized (`sanitizeCardName` in `helper.js`)
- ✅ Request body validation using custom validators
- ✅ Type checking for all parameters
- ⚠️ No SQL injection risk (using MongoDB with parameterized queries)
- ⚠️ Limited XSS protection (relies on React's default escaping)

**Vulnerabilities**:

- None critical identified

**Recommendations**:

1. Add input length limits to prevent memory exhaustion
2. Implement additional sanitization for special characters
3. Add schema validation using libraries like Joi or Zod

**Priority**: LOW

### Implementation Example

```javascript
// Add max length validation
function validateSearchQueryData(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query is required and must be a string.');
  }

  if (query.length > 500) {  // ADD THIS
    throw new Error('Search query is too long (max 500 characters).');
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new Error('Search query must be at least 2 characters long.');
  }

  return trimmed;
}
```

---

## 2. Authentication & Authorization

### Status: 🔴 MISSING (Not required for MVP)

**Findings**:

- ❌ No authentication system
- ❌ No user accounts
- ❌ No authorization checks
- ✅ Acceptable for MVP (anonymous usage)

**Current Risk**: LOW (since app doesn't store user data)

**Future Requirements**:

- User accounts for saving decks
- OAuth integration (Google, Discord, etc.)
- API key authentication for mobile apps
- Rate limiting per user (not just per IP)

**Recommendations for Future**:

1. Implement OAuth 2.0 (NextAuth.js for frontend)
2. Use JWT tokens for session management
3. Add role-based access control (admin vs. user)
4. Implement API key system for programmatic access

**Priority**: N/A for MVP, HIGH for post-MVP

---

## 3. Rate Limiting

### Status: 🟡 IMPLEMENTED (Needs Fine-Tuning)

**Findings**:

- ✅ Rate limiting implemented (`rateLimiter.js`)
- ✅ Different limits for different route types
- ✅ IP-based rate limiting
- ⚠️ No distributed rate limiting (won't work with multiple servers)
- ⚠️ Easily bypassed with VPN/proxy

**Current Limits**:

- General API: 100 requests / 15 minutes
- Package creation: 10 requests / minute
- Search: 30 requests / minute

**Vulnerabilities**:

- Multiple IPs can bypass limits (distributed attack)
- No persistent storage (resets on server restart)

**Recommendations**:

1. Use Redis for distributed rate limiting
2. Implement fingerprinting for better bot detection
3. Add CAPTCHA for suspicious activity
4. Monitor rate limit violations

**Priority**: MEDIUM

### Implementation Example

```javascript
// Use Redis for distributed rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis.js';

export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  // ... rest of config
});
```

---

## 4. CORS Configuration

### Status: 🟡 NEEDS IMPROVEMENT

**Findings**:

- ✅ CORS middleware configured
- ⚠️ Currently allows wildcard origin ('*')
- ⚠️ No origin whitelist enforcement in production
- ✅ Security middleware created but not yet deployed

**Current Configuration** (app.js):

```javascript
app.use(cors());  // Allows all origins
```

**Vulnerabilities**:

- Any website can make requests to your API
- CSRF attacks possible
- No protection against unauthorized frontends

**Recommendations**:

1. ✅ **ALREADY FIXED** - Switch to whitelist-based CORS (see `security.js`)
2. Deploy the new security middleware
3. Add proper origin validation
4. Use credentials: true for authenticated requests

**Priority**: HIGH

**Action Required**:
Deploy the CORS configuration from `middleware/security.js`:

```javascript
app.use(cors(getCorsOptions()));  // Use whitelisted origins
```

---

## 5. Environment Variables & Secrets

### Status: 🟢 ACCEPTABLE

**Findings**:

- ✅ Using `.env` files for configuration
- ✅ `.env` files in `.gitignore`
- ✅ Separate environments (dev, staging, production)
- ⚠️ MongoDB connection string includes credentials
- ⚠️ No secret rotation policy

**Environment Variables in Use**:

- `DB_URL` / `DB_URL_STAGING`
- `DB_NAME`
- `NODE_ENV`
- `REDIS_URL`
- Frontend URLs

**Vulnerabilities**:

- Credentials in connection strings (standard practice, but risky)
- No encryption at rest for secrets
- No audit log for secret access

**Recommendations**:

1. Use MongoDB's IP whitelist for additional security
2. Rotate MongoDB password regularly
3. Consider using secret management service (AWS Secrets Manager, HashiCorp Vault)
4. Avoid committing `.env.example` with real values

**Priority**: MEDIUM

---

## 6. HTTPS / TLS

### Status: 🟢 GOOD

**Findings**:

- ✅ Render provides automatic HTTPS
- ✅ TLS 1.2+ enforced by Render
- ✅ Valid SSL certificates (Let's Encrypt)
- ✅ HSTS headers configured (helmet middleware)
- ⚠️ No certificate pinning (not needed for web apps)

**Current Configuration**:

- All traffic uses HTTPS on Render
- Local development uses HTTP (acceptable)

**Recommendations**:

1. Add custom domain with SSL
2. Enable HSTS preload list submission
3. Monitor SSL Labs rating (aim for A+)

**Priority**: LOW

---

## 7. Dependencies & Vulnerabilities

### Status: 🟡 NEEDS ATTENTION

**Findings**:

- ⚠️ 20 vulnerabilities detected (npm audit)
  - 2 low
  - 3 moderate
  - 15 high
- ⚠️ Outdated packages

**Vulnerable Packages** (example):

```
To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

**Recommendations**:

1. Run `npm audit fix` to update non-breaking changes
2. Review breaking changes before `npm audit fix --force`
3. Set up Dependabot or Renovate for automatic updates
4. Regular security scanning (weekly)

**Priority**: HIGH

**Action Required**:

```bash
cd mtgv-api && npm audit fix
cd mtgv-web && npm audit fix
```

---

## 8. Error Handling & Information Disclosure

### Status: 🟢 GOOD

**Findings**:

- ✅ Custom error handling middleware
- ✅ No stack traces in production
- ✅ Generic error messages for users
- ✅ Detailed logging (server-side only)
- ✅ No sensitive data in error responses

**Current Behavior**:

- Development: Detailed errors for debugging
- Production: Generic "Internal server error"

**Recommendations**:

1. Implement correlation IDs for error tracking ✅ (already done in request logger)
2. Send errors to monitoring service (Sentry)
3. Regular log review for security events

**Priority**: LOW (already well-implemented)

---

## 9. Database Security

### Status: 🟢 ACCEPTABLE

**Findings**:

- ✅ MongoDB Atlas with authentication
- ✅ Network-level isolation (IP whitelist available)
- ✅ Using parameterized queries (no SQL injection)
- ⚠️ Free tier (M0) has limited security features
- ⚠️ No encryption at rest on free tier
- ⚠️ No automatic backups on free tier

**Current Setup**:

- MongoDB Atlas M0 (free tier)
- 512MB storage
- Shared cluster

**Recommendations for Production**:

1. Upgrade to M10+ for:
   - Encryption at rest
   - Automated backups
   - Point-in-time recovery
   - Performance insights
2. Enable audit logging
3. Use separate DB users for different environments
4. Regular backup testing

**Priority**: MEDIUM (upgrade for production)

---

## 10. API Security Best Practices

### Status: 🟡 NEEDS IMPROVEMENT

**Findings**:

- ✅ Input validation
- ✅ Rate limiting
- ✅ Error handling
- ⚠️ No request signing
- ⚠️ No API versioning
- ⚠️ No request size limits
- ⚠️ No response size limits (potential DoS)

**Missing Features**:

- API versioning (e.g., `/v1/card_package`)
- Request payload size limit
- Response payload size limit
- Request signature validation
- API documentation with security notes

**Recommendations**:

1. Add request size limit to body-parser:

```javascript
app.use(bodyParser.json({ limit: '10mb' }));
```

1. Implement API versioning:

```javascript
app.use('/v1', router);
```

1. Add compression limits:

```javascript
app.use(compression({ threshold: 0, level: 6 }));
```

**Priority**: MEDIUM

---

## 11. WebSocket Security

### Status: 🟡 NEEDS REVIEW

**Findings**:

- ✅ WebSocket server implemented
- ⚠️ No authentication for WebSocket connections
- ⚠️ No rate limiting on WebSocket messages
- ⚠️ No validation on incoming WebSocket messages

**Current Implementation**:

- WebSocket on port 4000 (same as HTTP)
- Package update broadcasting
- No access control

**Vulnerabilities**:

- Anyone can connect and receive updates
- Potential message flooding
- No message validation

**Recommendations**:

1. Add WebSocket authentication (token-based)
2. Implement message rate limiting
3. Validate all incoming messages
4. Add connection limits per IP
5. Implement heartbeat/keepalive with timeout

**Priority**: MEDIUM

### Implementation Example

```javascript
// Add WebSocket authentication
wss.on('connection', (ws, req) => {
  const token = req.headers['sec-websocket-protocol'];

  if (!isValidToken(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  // ... rest of connection logic
});

// Add message rate limiting
const messageLimit = new Map();  // IP -> message count
wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    const ip = req.socket.remoteAddress;
    const count = messageLimit.get(ip) || 0;

    if (count > 100) {  // 100 messages per connection
      ws.close(4008, 'Rate limit exceeded');
      return;
    }

    messageLimit.set(ip, count + 1);
    // ... handle message
  });
});
```

---

## 12. Frontend Security (Next.js)

### Status: 🟢 GOOD

**Findings**:

- ✅ React's built-in XSS protection
- ✅ Next.js security features enabled
- ✅ CSP headers configured (helmet)
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ Environment variables properly segmented
- ⚠️ No client-side input sanitization library

**Current Protection**:

- React escapes all user input by default
- Next.js sanitizes props automatically
- No direct DOM manipulation

**Recommendations**:

1. Add DOMPurify for any user-generated content
2. Implement Content Security Policy reporting
3. Add Subresource Integrity (SRI) for CDN resources
4. Regular frontend security audits

**Priority**: LOW

---

## 13. Logging & Monitoring

### Status: 🟢 GOOD (with room for enhancement)

**Findings**:

- ✅ Winston logger implemented
- ✅ Structured logging
- ✅ Request/response logging ✅ (new middleware)
- ✅ Error logging
- ✅ Performance metrics ✅ (new middleware)
- ⚠️ No log aggregation
- ⚠️ No security event monitoring

**Current Logging**:

- Console logs (dev)
- File logs (production)
- Error logs separate from info logs

**Recommendations for Production**:

1. Send logs to centralized service (LogRocket, Datadog, etc.)
2. Set up alerts for security events:
   - Multiple failed authentications (when implemented)
   - Rate limit violations
   - Unusual traffic patterns
   - Error rate spikes
3. Regular log review process
4. Log retention policy (GDPR compliance)

**Priority**: MEDIUM

---

## Summary of Action Items

### Immediate (This Week) - Critical Security

1. 🔴 **Deploy CORS whitelist** - Switch from wildcard to whitelist-based CORS
2. 🔴 **Fix npm vulnerabilities** - Run `npm audit fix` on both repos
3. 🟡 Add request size limits to prevent DoS
4. 🟡 Add WebSocket message validation

### Short Term (Next 2 Weeks) - Important Security

5. 🟡 Implement distributed rate limiting with Redis
2. 🟡 Add WebSocket connection limits and rate limiting
3. 🟡 Set up security monitoring (Sentry for errors)
4. 🟡 Add API versioning

### Medium Term (Before Production Launch) - Enhanced Security

9. 🟡 Upgrade MongoDB to M10+ for encryption and backups
2. 🟡 Implement comprehensive security headers
3. 🟡 Add log aggregation and alerting
4. 🟡 Regular security scanning (weekly)

### Long Term (Post-MVP) - Advanced Security

13. 🟢 Add authentication system (OAuth 2.0)
2. 🟢 Implement API keys for programmatic access
3. 🟢 Add CAPTCHA for bot protection
4. 🟢 Security penetration testing

---

## Security Score by Category

| Category | Score | Notes |
|----------|-------|-------|
| Input Validation | 8/10 | Good coverage, minor improvements needed |
| Authentication | N/A | Not required for MVP |
| Rate Limiting | 7/10 | Implemented but needs Redis |
| CORS | 6/10 | **Needs immediate fix** |
| Secrets Management | 7/10 | Acceptable, could be better |
| HTTPS/TLS | 9/10 | Well configured |
| Dependencies | 6/10 | **Vulnerabilities need fixing** |
| Error Handling | 9/10 | Well implemented |
| Database Security | 7/10 | Needs production tier |
| API Security | 7/10 | Good foundation, needs polish |
| WebSocket Security | 6/10 | Needs authentication and limits |
| Frontend Security | 8/10 | React/Next.js provide good defaults |
| Logging & Monitoring | 7/10 | Good logging, needs aggregation |

**Overall Average**: 7.3/10 (🟡 GOOD for MVP, needs improvement for production)

---

## Compliance Considerations

### GDPR (if/when you collect user data)

- ✅ No user data currently collected
- ⏳ Cookie consent not needed (no cookies used)
- ⏳ Privacy policy not required yet (no user data)
- ⚠️ When adding user accounts:
  - Need privacy policy
  - Need terms of service
  - Need data deletion process
  - Need data export process
  - Need consent management

### Accessibility (WCAG 2.1)

- ✅ Semantic HTML
- ⚠️ Some keyboard navigation issues
- ⚠️ Missing ARIA labels in places
- ⚠️ No screen reader testing yet

---

## Conclusion

The MTGV application has a **solid security foundation** for an MVP. The most critical issue is the CORS configuration which allows any origin - this should be fixed immediately. The npm vulnerabilities should also be addressed promptly.

For production launch, focus on:

1. Fixing CORS configuration ✅ (code ready, needs deployment)
2. Updating vulnerable dependencies
3. Implementing distributed rate limiting
4. Upgrading database tier for backups and encryption
5. Adding comprehensive monitoring

**The application is acceptable for staging and MVP testing but needs the above improvements before production launch with real users.**

---

**Next Steps**:

1. Review this audit with the team
2. Prioritize fixes based on impact and effort
3. Create GitHub issues for each action item
4. Schedule security review after fixes
5. Plan regular security audits (monthly for MVP, weekly for production)
