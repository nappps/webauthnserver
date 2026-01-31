const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require('../spec');
const { Buffer } = require('buffer');

const challengesStore = require('./challengesStore');
const challenges = challengesStore.getChallengesMap();

/**
 * Service for handling WebAuthn registration operations
 */
class RegistrationService {
  /**
   * Start the registration process by generating registration options
   * @param {Object} userData - User data including username and displayName
   * @returns {Object} Registration options for the client
   */
  async startRegistration(userData) {
    const { username, displayName } = userData;

    if (!username) {
      throw new Error('Username is required');
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: 'WebAuthn Level 3 Server',
      rpID: process.env.RP_ID || 'localhost',
      userID: username,
      userName: username,
      displayName: displayName || username,
      attestationType: 'none', // 'none', 'indirect', 'direct'

      // Specify authenticator selection criteria
      authenticatorSelection: {
        residentKey: 'preferred', // 'none', 'discouraged', 'preferred', 'required'
        userVerification: 'preferred', // 'none', 'discouraged', 'preferred', 'required'
        authenticatorAttachment: 'platform', // 'cross-platform', 'platform', undefined
      },

      // Supported pubKeyCredParams
      supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    });

    // Store the challenge for later verification
    const challenge = options.challenge;
    challenges.set(challenge, {
      userId: username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Clean up expired challenges periodically
    setTimeout(() => {
      this.cleanupExpiredChallenges();
    }, 60 * 1000); // Clean up every minute

    return options;
  }

  /**
   * Complete the registration process by verifying the registration response
   * @param {Object} registrationData - Registration response data from the client
   * @returns {Object} Verification result
   */
  async finishRegistration(registrationData) {
    const { id, rawId, response, type, clientExtensionResults } = registrationData;

    if (!id || !rawId || !response || !type) {
      throw new Error('Missing required fields in registration response');
    }

    // Extract the challenge from the response
    const { clientDataJSON } = response;

    // Find the stored challenge
    const challengeObj = JSON.parse(Buffer.from(clientDataJSON, 'base64').toString());
    const challenge = challengeObj.challenge;

    const storedChallenge = challenges.get(challenge);

    if (!storedChallenge) {
      throw new Error('Challenge not found or expired');
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: {
        id,
        rawId,
        response,
        type,
        clientExtensionResults,
      },
      expectedChallenge: challenge,
      expectedOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.RP_ID || 'localhost',
    });

    if (verification.verified && verification.registrationInfo) {
      // In a real implementation, you would store the credential in your database
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

      // Remove the used challenge
      challenges.delete(challenge);

      return {
        verified: true,
        credential: {
          id: credentialID,
          publicKey: credentialPublicKey.toString('base64'),
          counter,
        }
      };
    } else {
      return {
        verified: false,
        error: 'Registration verification failed'
      };
    }
  }

  /**
   * Helper function to clean up expired challenges
   */
  cleanupExpiredChallenges() {
    challengesStore.cleanupExpiredChallenges();
  }

  /**
   * Get all stored challenges (for debugging/testing purposes)
   */
  getAllChallenges() {
    return challenges;
  }
}

module.exports = new RegistrationService();