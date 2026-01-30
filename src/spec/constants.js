/**
 * WebAuthn Constants and Specification Values
 * Contains constants from the WebAuthn specification
 */

// COSE Algorithm Identifiers
const COSEALGORITHMS = {
  // ECDSA w/ SHA-256
  ES256: -7,
  // RSA SSA w/ SHA-256
  RS256: -257,
  // ECDSA w/ SHA-384
  ES384: -35,
  // ECDSA w/ SHA-512
  ES512: -36,
  // RSA SSA w/ SHA-384
  RS384: -258,
  // RSA SSA w/ SHA-512
  RS512: -259,
  // RSASSA-PSS w/ SHA-256
  PS256: -37,
  // RSASSA-PSS w/ SHA-384
  PS384: -38,
  // RSASSA-PSS w/ SHA-512
  PS512: -39,
  // EdDSA
  EdDSA: -8,
};

// Attestation Conveyance Preference
const ATTESTATION_CONVEYANCE_PREFERENCE = {
  NONE: 'none',
  INDIRECT: 'indirect',
  DIRECT: 'direct',
  ENTERPRISE: 'enterprise',
};

// Authenticator Attachment Modality
const AUTHENTICATOR_ATTACHMENT = {
  PLATFORM: 'platform',
  CROSS_PLATFORM: 'cross-platform',
};

// Resident Key Requirement
const RESIDENT_KEY_REQUIRED = {
  DISCOURAGED: 'discouraged',
  PREFERRED: 'preferred',
  REQUIRED: 'required',
};

// User Verification Requirement
const USER_VERIFICATION_REQUIREMENT = {
  DISCOURAGED: 'discouraged',
  PREFERRED: 'preferred',
  REQUIRED: 'required',
};

// Public Key Credential Type
const PUBLIC_KEY_CREDENTIAL_TYPE = {
  PUBLIC_KEY: 'public-key',
};

// Authentication Extensions
const AUTHENTICATION_EXTENSIONS = {
  APPID: 'appid',
  TX_AUTH_SIMPLE: 'txAuthSimple',
  TX_AUTH_GENERIC: 'txAuthGeneric',
  AUTHN_SEL: 'authnSel',
  EXT_FMT: 'extFmt',
  CRED_BLOB: 'credBlob',
  CRED_PROPS: 'credProps',
  LARGE_BLOB_KEY: 'largeBlobKey',
};

// Credential Mediation Requirement
const CREDENTIAL_MEDIATION_REQUIREMENT = {
  silent: 'silent',
  optional: 'optional',
  required: 'required',
  conditional: 'conditional',
};

// Status codes for authenticators
const AUTHENTICATOR_STATUS = {
  VALID: 'valid',
  WEAK_CRYPTOGRAPHY: 'weak-cryptography',
  COMPROMISED: 'compromised',
  TIER_UPGRADE_REQUIRED: 'tier-upgrade-required',
  PHISHING_RESISTANT_MANDATORY: 'phishing-resistant-mandatory',
};

module.exports = {
  COSEALGORITHMS,
  ATTESTATION_CONVEYANCE_PREFERENCE,
  AUTHENTICATOR_ATTACHMENT,
  RESIDENT_KEY_REQUIRED,
  USER_VERIFICATION_REQUIREMENT,
  PUBLIC_KEY_CREDENTIAL_TYPE,
  AUTHENTICATION_EXTENSIONS,
  CREDENTIAL_MEDIATION_REQUIREMENT,
  AUTHENTICATOR_STATUS,
};