# WebAuthn Level 3 Server Implementation

This project implements a WebAuthn Level 3 compliant authentication server using Node.js and Express.js. It provides secure, passwordless authentication using public key cryptography.

## Features

- ✅ WebAuthn Level 3 compliance
- ✅ Credential registration and authentication
- ✅ Support for multiple authenticator types (platform and cross-platform)
- ✅ Client capability detection
- ✅ Credential signaling (unknown credential, all accepted, user details)
- ✅ Secure challenge management
- ✅ Rate limiting and security best practices
- ✅ TypeScript-ready (with JSDoc annotations)
- ✅ Custom WebAuthn specification implementation (no external dependencies)

## Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd webauthn-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
RP_ID=localhost
CLIENT_ORIGIN=http://localhost:3000
PORT=8080
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:8080` (or the port specified in your environment).

## API Endpoints

### Registration

#### `POST /api/auth/register/start`
Initiates the credential registration process.

**Request Body:**
```json
{
  "username": "string",
  "displayName": "string"
}
```

**Response:**
Registration options for the client to use with `navigator.credentials.create()`.

#### `POST /api/auth/register/finish`
Completes the credential registration process.

**Request Body:**
The response from `navigator.credentials.create()`.

**Response:**
```json
{
  "verified": true,
  "credential": {
    "id": "credential_id",
    "publicKey": "public_key_base64",
    "counter": 0
  }
}
```

### Authentication

#### `POST /api/auth/authenticate/start`
Initiates the authentication process.

**Request Body:**
```json
{
  "username": "string"
}
```

**Response:**
Authentication options for the client to use with `navigator.credentials.get()`.

#### `POST /api/auth/authenticate/finish`
Completes the authentication process.

**Request Body:**
The response from `navigator.credentials.get()`.

**Response:**
```json
{
  "verified": true,
  "counter": 1
}
```

### WebAuthn Level 3 Specific Endpoints

#### `GET /api/auth/capabilities`
Returns client capabilities as defined in WebAuthn Level 3.

**Response:**
```json
{
  "supported": {
    "conditionalMediation": true,
    "largeBlob": true,
    "prf": true,
    "biometrics": true,
    "residentKey": true,
    "userVerification": true,
    "multipleAccounts": true
  },
  "version": "3.0",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### `POST /api/auth/signal-unknown-credential`
Signals to the authenticator that the credential being requested is unknown to the user.

**Request Body:**
```json
{
  "options": {}
}
```

#### `POST /api/auth/signal-all-accepted`
Signals to the authenticator that all offered credentials were accepted.

#### `POST /api/auth/signal-user-details`
Signals current user details to the authenticator.

### Health Check

#### `GET /health`
Returns the health status of the server.

## Environment Variables

- `RP_ID`: Relying Party ID (default: localhost)
- `CLIENT_ORIGIN`: Allowed client origin (default: http://localhost:3000)
- `PORT`: Server port (default: 8080)

## Testing

Run the test suite:
```bash
npm test
```

## Security Considerations

1. **Challenge Management**: Cryptographically random challenges are generated and stored temporarily with expiration.
2. **Origin Verification**: Strict origin checking is performed during verification.
3. **Rate Limiting**: Implemented to prevent brute force attacks.
4. **Secure Storage**: Credentials should be stored securely in a production environment (database with encryption).

## Architecture

The server follows a layered architecture:

- **Express.js Application Layer**: Handles HTTP requests and routing
- **Route Handlers**: Define API endpoints
- **Controllers**: Process requests and call service functions
- **Services Layer**: Core business logic (using @simplewebauthn/server)
- **Data Models**: Represent user and credential entities
- **Database Layer**: Persistent storage (implementation required)

## WebAuthn Level 3 Features

This implementation includes support for the following WebAuthn Level 3 features:

1. **Client Capabilities Detection**: Allows clients to determine what features are supported
2. **Credential Signaling**: Mechanisms to signal various credential states to authenticators
3. **Conditional Mediation**: Support for conditional UI in authentication flows
4. **Large Blob Extension**: Support for storing large amounts of data on authenticators
5. **Pseudo-Random Function Extension**: Support for advanced cryptographic operations

## Client Integration

To integrate with a client application, use the companion `@simplewebauthn/browser` library:

```javascript
import {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
} from '@simplewebauthn/browser';

// Registration
const options = await fetch('/api/auth/register/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', displayName: 'User Name' })
}).then(res => res.json());

const attResp = await startRegistration(options);
const verificationResult = await fetch('/api/auth/register/finish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(attResp),
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT