// This file is deprecated. Please use the spec files instead:
// ../spec/index.js
// This file remains for backward compatibility but should not be used.

console.warn('Warning: Using deprecated simplewebauthn-server.js. Please use ../spec instead.');

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('../spec');

module.exports = {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
};
