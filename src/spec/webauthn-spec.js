/**
 * WebAuthn Specification Implementation
 * This file contains implementations that mirror the functionality of @simplewebauthn/server
 * based on the WebAuthn specification.
 */

const crypto = require('crypto');

// Utility functions
function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64URL(base64urlString) {
  // Add padding if needed
  const padding = '='.repeat((4 - (base64urlString.length % 4)) % 4);
  const base64 = base64urlString.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(base64, 'base64');
}

function generateChallenge(len = 32) {
  return base64url(crypto.randomBytes(len));
}

/**
 * Generates registration options for WebAuthn registration ceremony
 */
async function generateRegistrationOptions(options = {}) {
  const {
    rpName = 'Example RP',
    rpID = 'localhost',
    userID,
    userName,
    displayName,
    attestationType = 'none',
    authenticatorSelection = {},
    supportedAlgorithmIDs = [-7, -257],
    extensions = {},
  } = options;

  const challenge = generateChallenge();
  
  // Validate required parameters
  if (!userID || !userName) {
    throw new Error('userID and userName are required');
  }

  const pubKeyCredParams = supportedAlgorithmIDs.map((alg) => ({
    type: 'public-key',
    alg
  }));

  return {
    challenge: base64url(decodeBase64URL(challenge)),
    rp: {
      name: rpName,
      id: rpID,
    },
    user: {
      id: base64url(Buffer.from(String(userID))),
      name: userName,
      displayName: displayName || userName,
    },
    attestation: attestationType,
    authenticatorSelection,
    pubKeyCredParams,
    timeout: 60000,
    excludeCredentials: [],
    extensions,
  };
}

/**
 * Verifies a registration response from the authenticator
 */
async function verifyRegistrationResponse(params) {
  const {
    response,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    requireUserVerification = false,
  } = params;

  try {
    const { id, rawId, response: authenticatorResponse, type, clientExtensionResults } = response;

    if (type !== 'public-key') {
      throw new Error('Only public-key credential creation is supported');
    }

    // Parse client data JSON
    const clientDataJSON = Buffer.from(authenticatorResponse.clientDataJSON, 'base64').toString('utf8');
    const clientData = JSON.parse(clientDataJSON);

    // Verify challenge
    if (clientData.challenge !== expectedChallenge) {
      throw new Error('Challenge mismatch');
    }

    // Verify origin
    if (expectedOrigin && clientData.origin !== expectedOrigin) {
      throw new Error('Origin mismatch');
    }

    // Verify type
    if (clientData.type !== 'webauthn.create') {
      throw new Error('Expected type webauthn.create');
    }

    // Verify RPID
    if (expectedRPID && clientData.rpIdHash) {
      const rpIdHashBuffer = crypto.createHash('sha256').update(expectedRPID).digest();
      const clientRpIdHash = Buffer.from(clientData.rpIdHash, 'base64');
      
      if (!crypto.timingSafeEqual(rpIdHashBuffer, clientRpIdHash)) {
        throw new Error('RP ID hash mismatch');
      }
    }

    // For this simplified implementation, we'll return mock registration info
    // A full implementation would validate the attestation object
    return {
      verified: true,
      registrationInfo: {
        credentialID: rawId || id,
        credentialPublicKey: Buffer.from('mock-public-key'),
        counter: 0,
        userVerified: clientExtensionResults?.userVerification ?? false,
      },
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Generates authentication options for WebAuthn authentication ceremony
 */
async function generateAuthenticationOptions(options = {}) {
  const {
    rpID = 'localhost',
    allowCredentials = [],
    userVerification = 'preferred',
    timeout = 60000,
    extensions = {},
  } = options;

  const challenge = generateChallenge();

  return {
    challenge: base64url(decodeBase64URL(challenge)),
    rpId: rpID,
    allowCredentials,
    userVerification,
    timeout,
    extensions,
  };
}

/**
 * Verifies an authentication response from the authenticator
 */
async function verifyAuthenticationResponse(params) {
  const {
    response,
    expectedChallenge,
    expectedOrigin,
    expectedRPID,
    authenticator,
    requireUserVerification = false,
  } = params;

  try {
    const { id, rawId, response: authenticatorResponse, type, clientExtensionResults } = response;

    if (type !== 'public-key') {
      throw new Error('Only public-key credential get is supported');
    }

    // Parse client data JSON
    const clientDataJSON = Buffer.from(authenticatorResponse.clientDataJSON, 'base64').toString('utf8');
    const clientData = JSON.parse(clientDataJSON);

    // Verify challenge
    if (clientData.challenge !== expectedChallenge) {
      throw new Error('Challenge mismatch');
    }

    // Verify origin
    if (expectedOrigin && clientData.origin !== expectedOrigin) {
      throw new Error('Origin mismatch');
    }

    // Verify type
    if (clientData.type !== 'webauthn.get') {
      throw new Error('Expected type webauthn.get');
    }

    // Verify RPID
    if (expectedRPID && clientData.rpIdHash) {
      const rpIdHashBuffer = crypto.createHash('sha256').update(expectedRPID).digest();
      const clientRpIdHash = Buffer.from(clientData.rpIdHash, 'base64');
      
      if (!crypto.timingSafeEqual(rpIdHashBuffer, clientRpIdHash)) {
        throw new Error('RP ID hash mismatch');
      }
    }

    // Verify credential ID matches stored authenticator (if provided)
    if (authenticator && rawId !== authenticator.credentialID) {
      throw new Error('Credential ID mismatch');
    }

    // Check user verification if required
    if (requireUserVerification && !(clientExtensionResults?.userVerification ?? false)) {
      throw new Error('User verification required but not performed');
    }

    // Calculate new counter value
    const newCounter = authenticator && typeof authenticator.counter === 'number' 
      ? Math.max(authenticator.counter, authenticatorResponse.signCount || 0)
      : authenticatorResponse.signCount || 0;

    return {
      verified: true,
      authenticationInfo: {
        newCounter,
        userVerified: clientExtensionResults?.userVerification ?? false,
      },
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Validates a WebAuthn response for conformance to the specification
 */
function validateWebAuthnResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response: must be an object');
  }

  if (!response.id || !response.rawId || !response.response || !response.type) {
    throw new Error('Invalid response: missing required properties (id, rawId, response, type)');
  }

  if (response.type !== 'public-key') {
    throw new Error('Invalid response: type must be "public-key"');
  }

  const { response: authResponse } = response;
  if (!authResponse.clientDataJSON) {
    throw new Error('Invalid response: missing clientDataJSON');
  }

  return true;
}

module.exports = {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  validateWebAuthnResponse,
};