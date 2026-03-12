import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: true, // Only send over HTTPS
  sameSite: 'Strict' // Strict same-site policy
};

const FILTER_COOKIE_NAME = 'analytics_filters';

// Save filter preferences to cookies
export const saveFilterPreferences = (filters) => {
  try {
    const filterData = {
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      age: filters.age || '',
      gender: filters.gender || ''
    };
    Cookies.set(FILTER_COOKIE_NAME, JSON.stringify(filterData), COOKIE_OPTIONS);
  } catch (error) {
    console.error('Failed to save filter preferences:', error);
  }
};

// Load filter preferences from cookies
export const loadFilterPreferences = () => {
  try {
    const savedFilters = Cookies.get(FILTER_COOKIE_NAME);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
  } catch (error) {
    console.error('Failed to load filter preferences:', error);
  }
  return {};
};

// Clear filter preferences
export const clearFilterPreferences = () => {
  Cookies.remove(FILTER_COOKIE_NAME);
};

// Token management (keeping existing functionality)
export const setToken = (token) => {
  Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'Strict' });
};

export const getToken = () => {
  return Cookies.get('auth_token');
};

export const removeToken = () => {
  Cookies.remove('auth_token');
};
