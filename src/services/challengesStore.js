// In-memory storage for challenges (in production, use Redis or database)
const challenges = new Map();

/**
 * Service for managing challenges across registration and authentication
 */
class ChallengesStore {
  /**
   * Get the challenges map
   * @returns {Map} The challenges map
   */
  getChallengesMap() {
    return challenges;
  }

  /**
   * Store a challenge
   * @param {string} challenge - The challenge string
   * @param {Object} data - The challenge data
   */
  storeChallenge(challenge, data) {
    challenges.set(challenge, data);
  }

  /**
   * Get a stored challenge
   * @param {string} challenge - The challenge string
   * @returns {Object|undefined} The challenge data or undefined if not found
   */
  getChallenge(challenge) {
    return challenges.get(challenge);
  }

  /**
   * Delete a challenge
   * @param {string} challenge - The challenge string to delete
   */
  deleteChallenge(challenge) {
    return challenges.delete(challenge);
  }

  /**
   * Clean up expired challenges
   */
  cleanupExpiredChallenges() {
    const now = Date.now();
    for (const [challenge, data] of challenges.entries()) {
      if (data.expiresAt < now) {
        challenges.delete(challenge);
      }
    }
  }

  /**
   * Get all stored challenges (for debugging/testing purposes)
   */
  getAllChallenges() {
    return challenges;
  }
}

module.exports = new ChallengesStore();