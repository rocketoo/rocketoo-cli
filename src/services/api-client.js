const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const ConfigManager = require('./config-manager');

class ApiClient {
  constructor() {
    this.config = new ConfigManager();
    this.baseURL = this.config.get('api_url', 'https://demo.rocketoo.cz');
    this.apiKey = this.config.get('api_key');
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'User-Agent': 'Rocketoo-CLI/1.0.0',
        'Accept': 'application/json'
      }
    });

    // Interceptor pro autentifikaci
    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers.Authorization = `Bearer ${this.apiKey}`;
      }
      return config;
    });

    // Interceptor pro error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Neplatný API klíč. Přihlaste se pomocí: rocketoo auth login');
        }
        
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        
        throw error;
      }
    );
  }

  /**
   * Nahraje šablonu na server
   */
  async uploadTheme(themeName, zipPath, options = {}) {
    try {
      const formData = new FormData();
      formData.append('theme_name', themeName);
      formData.append('theme_archive', fs.createReadStream(zipPath));
      
      if (options.description) {
        formData.append('description', options.description);
      }

      const response = await this.client.post('/api/v1/themes/upload', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aktivuje šablonu
   */
  async publishTheme(themeName, version = null) {
    try {
      const response = await this.client.post('/api/v1/themes/publish', {
        theme_name: themeName,
        version: version
      });

      return response.data;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Získá seznam šablon
   */
  async getThemes() {
    try {
      const response = await this.client.get('/api/v1/themes/');
      return response.data.themes;

    } catch (error) {
      throw new Error(`Chyba při načítání šablon: ${error.message}`);
    }
  }

  /**
   * Získá verze šablony
   */
  async getThemeVersions(themeName) {
    try {
      const response = await this.client.get(`/api/v1/themes/${themeName}/versions`);
      return response.data.versions;

    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(`Chyba při načítání verzí: ${error.message}`);
    }
  }

  /**
   * Získá aktuální aktivní šablonu
   */
  async getCurrentTheme() {
    try {
      const response = await this.client.get('/api/v1/themes/current');
      return response.data;

    } catch (error) {
      throw new Error(`Chyba při načítání aktivní šablony: ${error.message}`);
    }
  }

  /**
   * Testuje spojení s API
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/v1/themes/current');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ověří API klíč
   */
  async validateApiKey(apiKey) {
    try {
      const tempClient = axios.create({
        baseURL: this.baseURL,
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      await tempClient.get('/api/v1/themes/current');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ApiClient; 