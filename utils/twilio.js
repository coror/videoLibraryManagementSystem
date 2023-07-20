const twilio = require("twilio");

const accountSid = "AC643e21d9e3c18e3ca14d0e1783238099";
const authToken = "539efa3fe3f7cc71208371d2e0aa3c3c";
const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, body) {
  const formattedTo = to.replace(/\D/g, "");
  return client.messages.create({
    body,
    from: "whatsapp:+14155238886",
    to: `whatsapp:+${formattedTo}`,
  });
}

module.exports = {
  sendWhatsAppMessage,
};
