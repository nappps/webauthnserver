const registrationService = require('../services/registrationService');
const authenticationService = require('../services/authenticationService');
const deletionService = require('../services/deletionService');

// Registration
const startRegistration = async (req, res) => {
  try {
    const { username, displayName } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const options = await registrationService.startRegistration({ username, displayName });
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

    const result = await registrationService.finishRegistration({
      id,
      rawId,
      response,
      type,
      clientExtensionResults
    });

    if (result.verified) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Finish registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Authentication
const startAuthentication = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const options = await authenticationService.startAuthentication({ username });
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

    const result = await authenticationService.finishAuthentication({
      id,
      rawId,
      response,
      type,
      clientExtensionResults
    });

    if (result.verified) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
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

// Deletion functions
const deleteCredential = async (req, res) => {
  try {
    const { credentialId, userId } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await deletionService.deleteCredential(credentialId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAllUserCredentials = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await deletionService.deleteAllUserCredentials(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete all user credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

const revokeCredential = async (req, res) => {
  try {
    const { credentialId, userId } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await deletionService.revokeCredential(credentialId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Revoke credential error:', error);
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
  signalCurrentUserDetails,
  deleteCredential,
  deleteAllUserCredentials,
  revokeCredential
};