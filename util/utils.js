// utils.js
module.exports.generateActivationCode = () => {
    // Generate a random 6-character activation code
    return Math.random().toString(36).substr(2, 6).toUpperCase();
};
