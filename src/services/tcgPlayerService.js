import axios from "axios";
import logger from "./lib/logger.js";

class TCGPlayerService {
  constructor() {
    this.tokenCache = null;
  }
 
  async getBearerToken() {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    try {
      const response = await axios.post(
        "https://api.tcgplayer.com/token",
        `grant_type=client_credentials&client_id=${process.env.TCG_CLIENT_ID}&client_secret=${process.env.TCG_CLIENT_SECRET}`,
        { headers: { "Content-Type": "text/plain" } }
      );

      const { access_token, expires_in } = response.data;
      if (!access_token || !expires_in) {
        throw new Error("Token response is missing required data.");
      }

      const expiresAt = Date.now() + expires_in * 1000 - 60000;

      this.tokenCache = {
        token: access_token,
        expiresAt,
      };

      return access_token;
    } catch (error) {
      logger.error("Error fetching TCGPlayer token:", error);
      throw new Error("Could not fetch TCGPlayer token.");
    }
  }
}

export default new TCGPlayerService();