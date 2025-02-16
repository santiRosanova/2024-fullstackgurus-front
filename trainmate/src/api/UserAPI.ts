import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

// Obtener el token del usuario autenticado desde el localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error desconocido en la solicitud');
  }
  return response.json();
};

export const saveUserInfo = async (idToken: string, userInfo: { weight: number; height: number; name: string; email: string; password: string; sex: string; birthday: string; }) => {
  const token = `Bearer ${idToken}`;
  if (!token) throw new Error('Token no encontrado');

  const response = await fetch(`${BASE_URL}/save-user-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(userInfo)
  });

  return handleResponse(response);
};

export const getUserProfile = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Token no encontrado');

  const response = await fetch(`${BASE_URL}/get-user-info`, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  });

  if (response.status === 403 || response.status === 401) {
      const newToken = await refreshAuthToken();
      const retryResponse = await fetch(`${BASE_URL}/get-user-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });
      return handleResponse(retryResponse)
  }

  return handleResponse(response);
};

export const updateUserProfile = async (userInfo: { full_name?: string; gender?: string; weight?: string | number | null; height?: string| number | null}) => {
  const token = getAuthToken();
  if (!token) throw new Error('Token no encontrado');

  const response = await fetch(`${BASE_URL}/update-user-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(userInfo)
  });

  return handleResponse(response);
};