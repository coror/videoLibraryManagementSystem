require('dotenv').config()

const CryptoJS = require("crypto-js");

function decryptPhoneNumber(encryptedPhoneNumber) {
  const secretKey = process.env.CRYPTOJS_SECRET_KEY;
  const bytes = CryptoJS.AES.decrypt(encryptedPhoneNumber, secretKey);
  const decryptedPhoneNumber = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedPhoneNumber;
}

module.exports = {
  decryptPhoneNumber,
};
