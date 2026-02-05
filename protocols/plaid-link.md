# Plaid Link Protocol

Browser-based bank connection flow with localhost OAuth callback for CLI environments.

## Problem Being Solved

Users need to connect their bank accounts to PAI. This presents a challenge:
- **Plaid requires a web-based OAuth flow** where users authenticate directly with their bank
- **PAI runs in CLI**, which cannot display the bank's OAuth UI
- **Access tokens must be captured** after successful authentication and stored securely

The gap: How does a CLI application complete a browser-based OAuth flow?

## Solution

A temporary localhost server acts as a bridge between the browser OAuth flow and the CLI application:

1. **User requests bank connection** ("connect my bank")
2. **PAI starts localhost Express server** on port 8234
3. **PAI creates a Plaid Link token** via API
4. **Browser opens Plaid Link** hosted UI with the token
5. **User authenticates with their bank** in the browser
6. **Plaid redirects to localhost** with public_token
7. **PAI exchanges public_token for access_token** via API
8. **Access token stored** via [finance-storage](finance-storage.md) protocol
9. **Server shuts down** automatically

### Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Embedded webview | Plaid prohibits webviews for security |
| Manual token entry | Poor UX, error-prone |
| Persistent server | Unnecessary attack surface |
| Cloud callback URL | Privacy concerns, network dependency |
| **Localhost callback** | Secure, no network exposure, standard OAuth pattern |

## Credential Storage

### Plaid API Credentials

Plaid client credentials are stored separately from per-institution access tokens:

**Location:** `~/.pai/secrets/finance/plaid-credentials.json`

```json
{
  "client_id": "your_client_id",
  "secret": "your_development_secret",
  "environment": "development"
}
```

**Security requirements:**
- File permissions: `chmod 600` (owner read/write only)
- Directory permissions: `chmod 700` on `~/.pai/secrets/finance/`
- Never committed to version control
- Never logged or displayed

**Environment options:**
| Environment | Use Case | Data |
|-------------|----------|------|
| `sandbox` | Testing with fake credentials | Simulated transactions |
| `development` | Testing with real bank logins | Real transactions, limited institutions |
| `production` | Live production use | Real transactions, all institutions |

### Access Token Storage

Per-institution access tokens are stored in the encrypted SQLite database via [finance-storage](finance-storage.md) protocol in the `plaid_items` table.

## Flow Diagram

```
User: "connect my bank"
    |
    v
[PAI] Load credentials from ~/.pai/secrets/finance/plaid-credentials.json
    |
    v
[PAI] Start localhost:8234 callback server
    |
    v
[PAI] POST /link/token/create -> link_token
    |   (client_id, secret, products: ["transactions"])
    v
[PAI] Open browser: https://cdn.plaid.com/link/v2/stable/link.html
    |   ?isWebView=false&token={link_token}
    v
[Browser] Plaid Link UI loads
    |
    v
[Browser] User selects institution
    |
    v
[Browser] User enters bank credentials (Plaid handles this)
    |
    v
[Browser] Bank OAuth completes
    |
    v
[Browser] Plaid redirects to localhost:8234/callback?public_token=xxx
    |
    v
[PAI] Receive public_token from callback
    |
    v
[PAI] POST /item/public_token/exchange -> { access_token, item_id }
    |
    v
[PAI] Store in finance.db plaid_items table:
    |   - id: item_id
    |   - access_token: access_token (encrypted in SQLCipher db)
    |   - institution_id, institution_name (from /institutions/get_by_id)
    |   - status: 'active'
    |
    v
[PAI] Shutdown callback server
    |
    v
"Bank connected successfully! You can now sync transactions with 'pai finance sync'"
```

## Implementation

### Callback Server

```javascript
const express = require('express');
const open = require('open');

async function startCallbackServer(linkToken) {
  const app = express();
  let server;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server?.close();
      reject(new Error('Bank connection timed out after 5 minutes'));
    }, 5 * 60 * 1000);

    app.get('/callback', async (req, res) => {
      const { public_token, error } = req.query;

      if (error) {
        res.send('Connection cancelled. You can close this window.');
        clearTimeout(timeout);
        server.close();
        reject(new Error(`Plaid Link error: ${error}`));
        return;
      }

      if (public_token) {
        res.send('Bank connected! You can close this window.');
        clearTimeout(timeout);
        server.close();
        resolve(public_token);
      }
    });

    // Plaid Link redirect page
    app.get('/', (req, res) => {
      res.redirect(
        `https://cdn.plaid.com/link/v2/stable/link.html` +
        `?isWebView=false&token=${linkToken}` +
        `&receivedRedirectUri=http://localhost:8234/callback`
      );
    });

    server = app.listen(8234, () => {
      console.log('Callback server started on http://localhost:8234');
      open('http://localhost:8234');
    });
  });
}
```

### Token Exchange

```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

async function exchangeToken(publicToken, credentials) {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[credentials.environment],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': credentials.client_id,
        'PLAID-SECRET': credentials.secret,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);

  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}
```

### Link Token Creation

```javascript
async function createLinkToken(credentials, userId) {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[credentials.environment],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': credentials.client_id,
        'PLAID-SECRET': credentials.secret,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'PAI Finance',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
    redirect_uri: 'http://localhost:8234/callback',
  });

  return response.data.link_token;
}
```

### Complete Connection Flow

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

async function connectBank() {
  // 1. Load Plaid credentials
  const credPath = path.join(
    os.homedir(),
    '.pai/secrets/finance/plaid-credentials.json'
  );

  if (!fs.existsSync(credPath)) {
    throw new Error(
      'Plaid credentials not found. Please create ' +
      '~/.pai/secrets/finance/plaid-credentials.json with your client_id and secret.'
    );
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));

  // 2. Generate unique user ID (or load from storage)
  const userId = 'pai-user-' + Date.now();

  // 3. Create link token
  console.log('Creating Plaid Link token...');
  const linkToken = await createLinkToken(credentials, userId);

  // 4. Start callback server and open browser
  console.log('Opening browser for bank authentication...');
  const publicToken = await startCallbackServer(linkToken);

  // 5. Exchange for access token
  console.log('Exchanging token...');
  const { accessToken, itemId } = await exchangeToken(publicToken, credentials);

  // 6. Get institution info
  const institutionInfo = await getInstitutionInfo(accessToken, credentials);

  // 7. Store in database (via finance-storage protocol)
  await storeItem({
    id: itemId,
    accessToken: accessToken,
    institutionId: institutionInfo.institution_id,
    institutionName: institutionInfo.name,
    status: 'active',
  });

  console.log(`Connected: ${institutionInfo.name}`);
  return { itemId, institutionName: institutionInfo.name };
}
```

## Re-authentication Flow

Plaid access tokens can become invalid when:
- User changes bank password
- Bank requires periodic re-authentication
- Multi-factor authentication settings change
- Institution requires OAuth refresh

### Detection

The `plaid_items.status` field tracks connection health:
- `active` - Working normally
- `needs_reauth` - Token invalid, re-authentication required
- `removed` - User disconnected this institution

Status is updated when API calls return `ITEM_LOGIN_REQUIRED` error.

### Re-auth Flow

```
[PAI] Sync fails with ITEM_LOGIN_REQUIRED
    |
    v
[PAI] Update plaid_items.status = 'needs_reauth'
    |
    v
[PAI] Next user interaction:
    |   "Your Chase connection needs re-authentication."
    |   "Would you like to reconnect now?"
    v
[User] "yes"
    |
    v
[PAI] POST /link/token/create (with access_token for update mode)
    |
    v
[Standard Link flow continues...]
    |
    v
[PAI] Update existing plaid_items row with new access_token
    |
    v
"Chase connection restored!"
```

### Update Mode Link Token

```javascript
async function createUpdateLinkToken(credentials, userId, accessToken) {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[credentials.environment],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': credentials.client_id,
        'PLAID-SECRET': credentials.secret,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'PAI Finance',
    access_token: accessToken,  // Existing token triggers update mode
    country_codes: ['US'],
    language: 'en',
    redirect_uri: 'http://localhost:8234/callback',
  });

  return response.data.link_token;
}
```

## User Prompts

| Trigger | Prompt | Action |
|---------|--------|--------|
| "connect my bank" | "Opening browser for bank authentication..." | Start Link flow |
| "link my account" | "Opening browser for bank authentication..." | Start Link flow |
| "add bank account" | "Opening browser for bank authentication..." | Start Link flow |
| Sync fails with ITEM_LOGIN_REQUIRED | "Your {institution} connection needs re-authentication. Reconnect now?" | Offer re-auth flow |
| Connection times out | "Bank connection timed out. Please try again." | Cleanup, return to prompt |
| User cancels in browser | "Bank connection cancelled." | Cleanup, return to prompt |
| Multiple institutions connected | "Which institution would you like to reconnect?" | List options |

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `ITEM_LOGIN_REQUIRED` | Credentials changed at bank | Trigger re-auth flow |
| `INVALID_CREDENTIALS` | Wrong Plaid API credentials | Check plaid-credentials.json |
| `INSTITUTION_NOT_SUPPORTED` | Bank not available in Plaid | Inform user, suggest alternatives |
| `RATE_LIMIT_EXCEEDED` | Too many API calls | Back off, retry after delay |
| Port 8234 in use | Another process using port | Try alternate ports (8235, 8236) |
| Browser doesn't open | No default browser configured | Display URL for manual copy |
| Timeout (5 minutes) | User abandoned flow | Clean shutdown, inform user |
| Network error | No internet connectivity | Check connection, retry |
| Credential file missing | First-time setup incomplete | Guide user to create credentials file |

### Port Fallback

```javascript
const PORTS = [8234, 8235, 8236, 8237, 8238];

async function findAvailablePort() {
  for (const port of PORTS) {
    try {
      const server = await testPort(port);
      server.close();
      return port;
    } catch (e) {
      continue;
    }
  }
  throw new Error('No available ports for callback server');
}
```

## Security Considerations

### Localhost Callback Security

1. **Short-lived server:** Callback server runs only during auth flow (max 5 minutes)
2. **No external exposure:** Server binds to localhost only (127.0.0.1)
3. **One-time use:** Server shuts down immediately after receiving callback
4. **Token validation:** Public token can only be exchanged once

### Credential Protection

1. **File permissions:** 600 on credentials file, 700 on directory
2. **No logging:** Never log client_id, secret, or access_token
3. **No shell history:** Don't pass credentials as command arguments
4. **Encrypted storage:** Access tokens stored in SQLCipher-encrypted database

### HTTPS Considerations

Plaid Link itself runs over HTTPS. The localhost callback is HTTP because:
- Localhost doesn't need encryption (no network traversal)
- HTTPS localhost requires self-signed certs (complexity)
- Plaid allows HTTP for localhost redirect URIs

## Testing

### Sandbox Mode

Use sandbox environment for testing without real bank credentials:

1. Set `environment: "sandbox"` in plaid-credentials.json
2. Use Plaid's test credentials when prompted in Link:
   - Username: `user_good`
   - Password: `pass_good`
3. Fake transactions are returned

### Test Cases

| Scenario | How to Test |
|----------|-------------|
| Happy path | Use sandbox with `user_good` |
| Bad credentials | Use sandbox with `user_bad` |
| MFA required | Use sandbox with `user_mfa` |
| Institution error | Use sandbox with institution that returns errors |
| Timeout | Start flow, wait 5+ minutes |
| Cancel | Close browser during Link flow |

## Related Protocols

- [Finance Storage](finance-storage.md) - Where access tokens are stored
- [Autonomy Levels](autonomy-levels.md) - Finance domain is Advisor level

## Dependencies

```bash
# Plaid SDK
npm install plaid

# Callback server
npm install express

# Browser opening
npm install open
```
