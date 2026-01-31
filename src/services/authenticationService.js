const {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('../spec');
const { Buffer } = require('buffer');

const challengesStore = require('./challengesStore');
const challenges = challengesStore.getChallengesMap();

/**
 * Service for handling WebAuthn authentication operations
 */
class AuthenticationService {
  /**
   * Start the authentication process by generating authentication options
   * @param {Object} userData - User data including username
   * @returns {Object} Authentication options for the client
   */
  async startAuthentication(userData) {
    const { username } = userData;

    if (!username) {
      throw new Error('Username is required');
    }

    // In a real implementation, you would fetch the user's registered credentials from your database
    // For this example, we'll simulate having some credentials
    const allowCredentials = []; // This would come from your database

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || 'localhost',
      allowCredentials,
      userVerification: 'preferred', // 'none', 'discouraged', 'preferred', 'required'
      timeout: 60000, // 1 minute
    });

    // Store the challenge for later verification
    const challenge = options.challenge;
    challenges.set(challenge, {
      userId: username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    return options;
  }

  /**
   * Complete the authentication process by verifying the authentication response
   * @param {Object} authenticationData - Authentication response data from the client
   * @returns {Object} Verification result
   */
  async finishAuthentication(authenticationData) {
    const { id, rawId, response, type, clientExtensionResults } = authenticationData;

    if (!id || !rawId || !response || !type) {
      throw new Error('Missing required fields in authentication response');
    }

    // Extract the challenge from the response
    const { clientDataJSON } = response;

    // Find the stored challenge
    const challenge = JSON.parse(Buffer.from(clientDataJSON, 'base64').toString()).challenge;

    const storedChallenge = challenges.get(challenge);

    if (!storedChallenge) {
      throw new Error('Challenge not found or expired');
    }

    // In a real implementation, you would fetch the credential details from your database
    // For this example, we'll use mock data
    const credential = {
      id: rawId,
      publicKey: Buffer.from([]), // This would come from your database
      counter: 0, // This would come from your database
    };

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
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
      authenticator: {
        credentialID: credential.id,
        credentialPublicKey: credential.publicKey,
        counter: credential.counter,
      },
    });

    if (verification.verified) {
      // Update the counter in your database in a real implementation
      const { authenticationInfo } = verification;

      // Remove the used challenge
      challenges.delete(challenge);

      return {
        verified: true,
        counter: authenticationInfo.newCounter,
      };
    } else {
      return {
        verified: false,
        error: 'Authentication verification failed'
      };
    }
  }

  /**
   * Get all stored challenges (for debugging/testing purposes)
   */
  getAllChallenges() {
    return challenges;
  }
}

module.exports = new AuthenticationService();