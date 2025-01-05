const Model = require('./model')
const axios = require("axios");

class TcgpClient extends Model {
  constructor() {
    super('tcgpClients');
  }

  async fetchToken() {
    const response = await axios
    .post(
      'https://api.tcgplayer.com/token',
      `grant_type=client_credentials&client_id=${process.env.TCG_CLIENT_ID}&client_secret=${process.env.TCG_CLIENT_SECRET}`,
      { headers: { "Content-Type": "text/plain" } }
    )
    return response.data;
  }
}

module.exports = TcgpClient
