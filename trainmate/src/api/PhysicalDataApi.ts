import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};
  
  interface PhysicalData {
    date: string;
    weight: number;
    body_fat: number;
    body_muscle: number;
  }

export const getPhysicalData = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Token no encontrado');
  
  try {
    const response = await fetch(`${BASE_URL}/api/physical-data/get-physical-data`, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  });

  // Si la respuesta es 403, intentamos renovar el token
  if (response.status === 403 || response.status === 401) {
      const newToken = await refreshAuthToken(); // Renueva el token
      // Intentamos la solicitud de nuevo con el nuevo token
      const retryResponse = await fetch(`${BASE_URL}/api/physical-data/get-physical-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al obtener physical data');
      }

      const retryData = await retryResponse.json();
      return retryData;
    }

    // Si no es 401, seguimos con el flujo normal
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener physical data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener physical data:', error);
    throw error;
  }
}

export const savePhysicalData = async (saveData: PhysicalData) => {
      const token = getAuthToken();
      if (!token) throw new Error('Token no encontrado');
  
      try {
        const response = await fetch(`${BASE_URL}/api/physical-data/add`, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saveData),
        });
  
        // Si la respuesta es 403, intentamos renovar el token
        if (response.status === 403 || response.status === 401) {
          const newToken = await refreshAuthToken(); // Renueva el token
          // Intentamos la solicitud de nuevo con el nuevo token
          const retryResponse = await fetch(`${BASE_URL}/api/physical-data/add`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(saveData),
          });
    
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json();
            throw new Error(errorData.error || 'Error al guardar physical data');
          }
    
          const retryData = await retryResponse.json();
          return retryData;
        }
    
        // Si no es 401, seguimos con el flujo normal
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar physical data');
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error al guardar physical data:', error);
        throw error;
      }
    }