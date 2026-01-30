const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require('../spec');
const { Buffer } = require('buffer');

// In-memory storage for challenges (in production, use Redis or database)
const challenges = new Map();

// Registration
const startRegistration = async (req, res) => {
  try {
    const { username, displayName } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
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
      cleanupExpiredChallenges();
    }, 60 * 1000); // Clean up every minute

    res.status(200).json(options);
  } catch (error) {
    console.error('Start registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

const finishRegistration = async (req, res) => {
  try {
    const { id, rawId, response, type, clientExtensionResults } = req.body;

    if (!id || !rawId || !response || !type) {
      return res.status(400).json({ error: 'Missing required fields in registration response' });
    }

    // Extract the challenge from the response
    const { clientDataJSON, attestationObject } = response;

    // Find the stored challenge
    // Note: In a real implementation, you'd need to extract the challenge from the clientDataJSON
    // For now, we'll use a simplified approach
    const challenge = JSON.parse(Buffer.from(clientDataJSON, 'base64').toString()).challenge;

    const storedChallenge = challenges.get(challenge);

    if (!storedChallenge) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
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

      // Return success response
      res.status(200).json({
        verified: true,
        credential: {
          id: credentialID,
          publicKey: credentialPublicKey.toString('base64'),
          counter,
        }
      });

      // Remove the used challenge
      challenges.delete(challenge);
    } else {
      res.status(400).json({
        verified: false,
        error: 'Registration verification failed'
      });
    }
  } catch (error) {
    console.error('Finish registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to clean up expired challenges
function cleanupExpiredChallenges() {
  const now = Date.now();
  for (const [challenge, data] of challenges.entries()) {
    if (data.expiresAt < now) {
      challenges.delete(challenge);
    }
  }
}

// Authentication
const {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('../spec');
const startAuthentication = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
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

    res.status(200).json(options);
  } catch (error) {
    console.error('Start authentication error:', error);
    res.status(500).json({ error: error.message });
  }
};

const finishAuthentication = async (req, res) => {
  try {
    const { id, rawId, response, type, clientExtensionResults } = req.body;

    if (!id || !rawId || !response || !type) {
      return res.status(400).json({ error: 'Missing required fields in authentication response' });
    }

    // Extract the challenge from the response
    const { clientDataJSON, authenticatorData, signature } = response;

    // Find the stored challenge
    const challenge = JSON.parse(Buffer.from(clientDataJSON, 'base64').toString()).challenge;

    const storedChallenge = challenges.get(challenge);

    if (!storedChallenge) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
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

      // Return success response
      res.status(200).json({
        verified: true,
        counter: authenticationInfo.newCounter,
      });

      // Remove the used challenge
      challenges.delete(challenge);
    } else {
      res.status(400).json({
        verified: false,
        error: 'Authentication verification failed'
      });
    }
  } catch (error) {
    console.error('Finish authentication error:', error);
    res.status(500).json({ error: error.message });
  }
};

// WebAuthn Level 3 specific functions
const getClientCapabilities = async (req, res) => {
  try {
    // Return client capabilities as defined in WebAuthn Level 3
    // This endpoint would typically be called by the client to determine
    // what features are supported by the client's browser/authenticator
    res.status(200).json({
      // Indicate support for various WebAuthn Level 3 features
      supported: {
        // Conditional mediation (conditional UI) support
        conditionalMediation: true,

        // LargBlob extension support
        largeBlob: true,

        // Pseudo-random function extension support
        prf: true,

        // Biometric authentication support
        biometrics: true,

        // Resident key (passkey) support
        residentKey: true,

        // User verification support
        userVerification: true,

        // Multiple accounts per RP support
        multipleAccounts: true,
      },

      // Version information
      version: '3.0',

      // Timestamp of when capabilities were determined
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get client capabilities error:', error);
    res.status(500).json({ error: error.message });
  }
};

const signalUnknownCredential = async (req, res) => {
  try {
    const { options } = req.body;

    if (!options) {
      return res.status(400).json({ error: 'Options are required' });
    }

    // In a real implementation, this would signal to the authenticator
    // that the credential being requested is unknown to the user
    // This could trigger a UX flow to help the user select the right credential

    // For now, we'll just log this event and return a success response
    console.log('Received signal for unknown credential:', options);

    res.status(200).json({
      success: true,
      message: 'Credential signaling processed',
      handled: true,
    });
  } catch (error) {
    console.error('Signal unknown credential error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Additional WebAuthn Level 3 features that could be implemented
const signalAllAcceptedCredentials = async (req, res) => {
  try {
    const { options } = req.body;

    if (!options) {
      return res.status(400).json({ error: 'Options are required' });
    }

    // Signal to the authenticator that all offered credentials were accepted
    console.log('Received signal for all accepted credentials:', options);

    res.status(200).json({
      success: true,
      message: 'All credentials accepted signal processed',
      handled: true,
    });
  } catch (error) {
    console.error('Signal all accepted credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

const signalCurrentUserDetails = async (req, res) => {
  try {
    const { options } = req.body;

    if (!options) {
      return res.status(400).json({ error: 'Options are required' });
    }

    // Signal current user details to the authenticator
    // This can help with credential selection and UX
    console.log('Received signal for current user details:', options);

    res.status(200).json({
      success: true,
      message: 'Current user details signal processed',
      handled: true,
    });
  } catch (error) {
    console.error('Signal current user details error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
  getClientCapabilities,
  signalUnknownCredential,
  signalAllAcceptedCredentials,
  signalCurrentUserDetails
};