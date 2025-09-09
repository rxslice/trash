// This service uses the 'crypto-js' library.
// Ensure it is available in the execution environment.
import CryptoJS from 'crypto-js';

const AUTH_KEY = 'AIWINLAB_AUTH_V2';
const LEGAL_KEY = 'AIWINLAB_LEGAL_V1';
const PROGRESS_KEY = 'AIWINLAB_PROGRESS_V2';

const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

export const authService = {
  getAuthData: (): { username: string; passwordHash: string } | null => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to parse auth data:", error);
      return null;
    }
  },

  saveAuthData: (username: string, password: string): void => {
    const passwordHash = hashPassword(password);
    const data = JSON.stringify({ username, passwordHash });
    localStorage.setItem(AUTH_KEY, data);
  },

  verifyPassword: (password: string): boolean => {
    const authData = authService.getAuthData();
    if (!authData) return false;
    return authData.passwordHash === hashPassword(password);
  },

  hasAcceptedLegal: (): boolean => {
    return localStorage.getItem(LEGAL_KEY) === 'accepted';
  },

  acceptLegal: (): void => {
    localStorage.setItem(LEGAL_KEY, 'accepted');
  },

  saveProgress: (responses: Record<string, string>): void => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(responses));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  },

  loadProgress: (): Record<string, string> => {
    try {
      const progress = localStorage.getItem(PROGRESS_KEY);
      return progress ? JSON.parse(progress) : {};
    } catch (error) {
      console.error("Failed to load progress:", error);
      return {};
    }
  },

  clearAllData: (): void => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGAL_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    window.location.reload();
  },
};
