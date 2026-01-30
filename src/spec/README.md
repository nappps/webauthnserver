# WebAuthn Specification Implementation

This directory contains our custom implementation of WebAuthn specification functionality, designed to replace the external `@simplewebauthn/server` dependency.

## Files

- `index.js` - Main entry point that exports all WebAuthn functionality
- `webauthn-spec.js` - Core WebAuthn functions (registration and authentication)
- `constants.js` - WebAuthn specification constants and values
- `utils.js` - Utility functions for WebAuthn operations

## Purpose

This implementation provides:

1. **Registration Options Generation** - Creates options for credential registration
2. **Registration Response Verification** - Verifies registration responses from authenticators
3. **Authentication Options Generation** - Creates options for credential authentication
4. **Authentication Response Verification** - Verifies authentication responses from authenticators
5. **Utility Functions** - Helper functions for common WebAuthn operations
6. **Specification Compliance** - Implements WebAuthn Level 3 features

## Usage

Import the functionality directly:

```javascript
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('./src/spec');
```

Or import the entire module:

```javascript
const WebAuthn = require('./src/spec');
```

## Benefits

- No external dependencies for core WebAuthn functionality
- Full control over the implementation
- Ability to customize for specific needs
- Better understanding of WebAuthn internals
- Reduced bundle size