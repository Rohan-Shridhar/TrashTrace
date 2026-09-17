/**
 * Gets or generates a unique owner token from localStorage.
 * This identifies the creator of the trash packages in this browser.
 * 
 * @returns {string} The owner token
 */
export const getOwnerToken = () => {
  const STORAGE_KEY = 'trashTraceOwnerToken';
  let token = localStorage.getItem(STORAGE_KEY);
  
  if (!token) {
    // Generate a simple random token if none exists (fallback for UUID)
    token = 'owner_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEY, token);
  }
  
  return token;
};
