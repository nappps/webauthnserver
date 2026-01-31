const express = require('express');
const {
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
} = require('../controllers/authController');

const router = express.Router();

// Registration routes
router.post('/register/start', startRegistration);
router.post('/register/finish', finishRegistration);

// Authentication routes
router.post('/authenticate/start', startAuthentication);
router.post('/authenticate/finish', finishAuthentication);

// Deletion routes
router.delete('/credential', deleteCredential);
router.delete('/user/credentials', deleteAllUserCredentials);
router.patch('/credential/revoke', revokeCredential);

// WebAuthn Level 3 specific routes
router.get('/capabilities', getClientCapabilities);
router.post('/signal-unknown-credential', signalUnknownCredential);
router.post('/signal-all-accepted', signalAllAcceptedCredentials);
router.post('/signal-user-details', signalCurrentUserDetails);

module.exports = router;