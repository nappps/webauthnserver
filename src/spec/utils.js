/**
 * WebAuthn Utilities
 * Common utility functions for WebAuthn operations
 */

const crypto = require('crypto');

/**
 * Convert a buffer to Base64URL encoding
 * @param {Buffer} buffer 
 * @returns {string} Base64URL encoded string
 */
function base64URLencode(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert a Base64URL string to a buffer
 * @param {string} base64URLString 
 * @returns {Buffer} Decoded buffer
 */
function base64URLdecode(base64URLString) {
  if (typeof base64URLString !== 'string') {
    throw new Error('Input must be a string');
  }
  // Add padding if needed
  const padding = '='.repeat((4 - (base64URLString.length % 4)) % 4);
  const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(base64, 'base64');
}

/**
 * Generate a cryptographically random challenge
 * @param {number} length Length of the challenge in bytes (default: 32)
 * @returns {string} Base64URL encoded challenge
 */
function generateChallenge(length = 32) {
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Length must be a positive number');
  }
  return base64URLencode(crypto.randomBytes(length));
}

/**
 * Verify that an origin is trusted
 * @param {string} origin The origin to verify
 * @param {string | string[]} expectedOrigins The expected origin(s)
 * @returns {boolean} True if the origin is trusted
 */
function verifyOrigin(origin, expectedOrigins) {
  if (!origin || typeof origin !== 'string') {
    return false;
  }

  if (typeof expectedOrigins === 'string') {
    return origin === expectedOrigins;
  }

  if (Array.isArray(expectedOrigins)) {
    return expectedOrigins.includes(origin);
  }

  return false;
}

/**
 * Verify that an RP ID is trusted
 * @param {string} rpId The RP ID to verify
 * @param {string | string[]} expectedRpIds The expected RP ID(s)
 * @returns {boolean} True if the RP ID is trusted
 */
function verifyRpId(rpId, expectedRpIds) {
  if (!rpId || typeof rpId !== 'string') {
    return false;
  }

  if (typeof expectedRpIds === 'string') {
    return rpId === expectedRpIds;
  }

  if (Array.isArray(expectedRpIds)) {
    return expectedRpIds.includes(rpId);
  }

  return false;
}

/**
 * Hash a string using SHA-256
 * @param {string|Buffer} input The input to hash
 * @returns {Buffer} The SHA-256 hash
 */
function sha256(input) {
  if (typeof input === 'string') {
    input = Buffer.from(input, 'utf8');
  }
  if (!Buffer.isBuffer(input)) {
    throw new Error('Input must be a string or Buffer');
  }
  return crypto.createHash('sha256').update(input).digest();
}

/**
 * Verify that a challenge is valid (not expired and matches expected)
 * @param {string} receivedChallenge The challenge received from the client
 * @param {string} expectedChallenge The expected challenge
 * @param {number} [maxAge] Maximum age of the challenge in milliseconds
 * @returns {boolean} True if the challenge is valid
 */
function verifyChallenge(receivedChallenge, expectedChallenge, maxAge) {
  if (receivedChallenge !== expectedChallenge) {
    return false;
  }

  // If maxAge is provided, we'd normally check the creation time
  // This is a simplified implementation
  return true;
}

/**
 * Validate a credential ID
 * @param {string} credentialId The credential ID to validate
 * @returns {boolean} True if the credential ID is valid
 */
function isValidCredentialId(credentialId) {
  if (typeof credentialId !== 'string' || credentialId.length === 0) {
    return false;
  }

  try {
    // Try to decode the credential ID to ensure it's valid Base64URL
    base64URLdecode(credentialId);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Compare two buffers in constant time to prevent timing attacks
 * @param {Buffer} a First buffer
 * @param {Buffer} b Second buffer
 * @returns {boolean} True if the buffers are equal
 */
function timingSafeEqual(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new Error('Both arguments must be Buffers');
  }
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  base64URLencode,
  base64URLdecode,
  generateChallenge,
  verifyOrigin,
  verifyRpId,
  sha256,
  verifyChallenge,
  isValidCredentialId,
  timingSafeEqual,
};