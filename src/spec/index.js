/**
 * WebAuthn Specification Index
 * Main entry point for WebAuthn specification implementations
 */

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  validateWebAuthnResponse,
} = require('./webauthn-spec');

const {
  COSEALGORITHMS,
  ATTESTATION_CONVEYANCE_PREFERENCE,
  AUTHENTICATOR_ATTACHMENT,
  RESIDENT_KEY_REQUIRED,
  USER_VERIFICATION_REQUIREMENT,
  PUBLIC_KEY_CREDENTIAL_TYPE,
  AUTHENTICATION_EXTENSIONS,
  CREDENTIAL_MEDIATION_REQUIREMENT,
  AUTHENTICATOR_STATUS,
} = require('./constants');

const {
  base64URLencode,
  base64URLdecode,
  generateChallenge,
  verifyOrigin,
  verifyRpId,
  sha256,
  verifyChallenge,
  isValidCredentialId,
  timingSafeEqual,
} = require('./utils');

module.exports = {
  // Main functions
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  validateWebAuthnResponse,
  
  // Constants
  COSEALGORITHMS,
  ATTESTATION_CONVEYANCE_PREFERENCE,
  AUTHENTICATOR_ATTACHMENT,
  RESIDENT_KEY_REQUIRED,
  USER_VERIFICATION_REQUIREMENT,
  PUBLIC_KEY_CREDENTIAL_TYPE,
  AUTHENTICATION_EXTENSIONS,
  CREDENTIAL_MEDIATION_REQUIREMENT,
  AUTHENTICATOR_STATUS,
  
  // Utilities
  base64URLencode,
  base64URLdecode,
  generateChallenge,
  verifyOrigin,
  verifyRpId,
  sha256,
  verifyChallenge,
  isValidCredentialId,
  timingSafeEqual,
  
  // For convenience, also export as a namespace
  WebAuthn: {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    validateWebAuthnResponse,
    
    COSEALGORITHMS,
    ATTESTATION_CONVEYANCE_PREFERENCE,
    AUTHENTICATOR_ATTACHMENT,
    RESIDENT_KEY_REQUIRED,
    USER_VERIFICATION_REQUIREMENT,
    PUBLIC_KEY_CREDENTIAL_TYPE,
    AUTHENTICATION_EXTENSIONS,
    CREDENTIAL_MEDIATION_REQUIREMENT,
    AUTHENTICATOR_STATUS,
    
    base64URLencode,
    base64URLdecode,
    generateChallenge,
    verifyOrigin,
    verifyRpId,
    sha256,
    verifyChallenge,
    isValidCredentialId,
    timingSafeEqual,
  }
};