import { api } from './apiClient';

// Flag to determine if we're using mock data or real API
const USE_MOCK = true; // Set to false when backend is ready

// Mock storage key
const SAVED_SEARCHES_STORAGE_KEY = 'mazadat_saved_searches';

// ============================================
// Mock Implementation (localStorage-based)
// ============================================

const getMockSavedSearches = () => {
  try {
    const stored = localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockSavedSearches = (searches) => {
  try {
    localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Failed to save searches:', error);
  }
};

const mockGetSavedSearches = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return getMockSavedSearches();
};

const mockCreateSavedSearch = async (data) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const searches = getMockSavedSearches();

  // Check if name already exists
  if (searches.some(search => search.name.toLowerCase() === data.name.toLowerCase())) {
    throw new Error('A saved search with this name already exists');
  }

  const newSearch = {
    id: Date.now(), // Mock ID
    name: data.name,
    filters: data.filters,
    userId: 1, // Mock user ID - will be replaced by backend
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [...searches, newSearch];
  saveMockSavedSearches(updated);

  return newSearch;
};

const mockUpdateSavedSearch = async (id, data) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const searches = getMockSavedSearches();
  const index = searches.findIndex(search => search.id === id);

  if (index === -1) {
    throw new Error('Saved search not found');
  }

  // Check if new name conflicts with another search
  if (data.name) {
    const nameConflict = searches.some(
      search => search.id !== id && search.name.toLowerCase() === data.name.toLowerCase()
    );
    if (nameConflict) {
      throw new Error('A saved search with this name already exists');
    }
  }

  const updatedSearch = {
    ...searches[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  searches[index] = updatedSearch;
  saveMockSavedSearches(searches);

  return updatedSearch;
};

const mockDeleteSavedSearch = async (id) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const searches = getMockSavedSearches();
  const updated = searches.filter(search => search.id !== id);
  saveMockSavedSearches(updated);

  return { success: true };
};

// ============================================
// Real API Implementation
// ============================================

const apiGetSavedSearches = () => api.get('/saved-searches');

const apiCreateSavedSearch = (data) =>
  api.post('/saved-searches', data);

const apiUpdateSavedSearch = (id, data) =>
  api.put(`/saved-searches/${id}`, data);

const apiDeleteSavedSearch = (id) =>
  api.delete(`/saved-searches/${id}`);

// ============================================
// Exported Service (switches between mock and real)
// ============================================

export const getSavedSearches = USE_MOCK ? mockGetSavedSearches : apiGetSavedSearches;

export const createSavedSearch = USE_MOCK ? mockCreateSavedSearch : apiCreateSavedSearch;

export const updateSavedSearch = USE_MOCK ? mockUpdateSavedSearch : apiUpdateSavedSearch;

export const deleteSavedSearch = USE_MOCK ? mockDeleteSavedSearch : apiDeleteSavedSearch;
