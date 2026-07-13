import type { Substation } from '../types/database';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.reload();
        throw new Error('Sessiya tugagan. Iltimos, qayta kiring.');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Xatolik yuz berdi' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }
    return response.json();
}

export const api = {
    // Auth
    login: (email: string, password: string): Promise<{ user: any; token: string }> => {
        return fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, password }),
        }).then((r) => handleResponse<{ user: any; token: string }>(r));
    },

    logout: (): Promise<void> => {
        return fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: { ...getAuthHeaders() },
        }).then(() => {
            localStorage.removeItem('auth_token');
        });
    },

    getMe: (): Promise<any> => {
        return fetch(`${API_BASE}/me`, {
            headers: { ...getAuthHeaders() },
        }).then((r) => handleResponse<any>(r));
    },

    // Substations
    getSubstations: (): Promise<Substation[]> => {
        return fetch(`${API_BASE}/substations`, {
            headers: { ...getAuthHeaders() },
        }).then((r) => handleResponse<Substation[]>(r));
    },

    createSubstation: (data: Partial<Substation>): Promise<Substation> => {
        return fetch(`${API_BASE}/substations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(data),
        }).then((r) => handleResponse<Substation>(r));
    },

    updateSubstation: (id: string, data: Partial<Substation>): Promise<Substation> => {
        return fetch(`${API_BASE}/substations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(data),
        }).then((r) => handleResponse<Substation>(r));
    },

    deleteSubstation: (id: string): Promise<void> => {
        return fetch(`${API_BASE}/substations/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeaders() },
        }).then((r) => {
            if (r.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.reload();
            }
            if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        });
    },
};
