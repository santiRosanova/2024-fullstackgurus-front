import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};

export const getWaterIntakeHistory = async (startDate: string, endDate: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
      const response = await fetch(`${BASE_URL}/api/water-intake/get-water-intake-history?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    // Si la respuesta es 403, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/water-intake/get-water-intake-history?start_date=${startDate}&end_date=${endDate}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al obtener la ingesta diaria de agua');
        }
  
        const retryData = await retryResponse.json();
        return retryData;
      }
  
      // Si no es 401, seguimos con el flujo normal
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la ingesta diaria de agua');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener la ingesta diaria de agua:', error);
      throw error;
    }
  };

  export const addWaterIntake = async (currentDate: string, quantityInMiliters: number) => {
    
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');

    try {
      const response = await fetch(`${BASE_URL}/api/water-intake/add`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity_in_militers: quantityInMiliters, date: currentDate })
      });
  
      // Si la respuesta es 401, intentamos renovar el token
      if (response.status === 403 || response.status === 401) {
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/water-intake/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify({ quantity_in_militers: quantityInMiliters, date: currentDate })
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al agregar o eliminar ingesta de agua');
        }
  
        const retryData = await retryResponse.json();
        return retryData;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar o eliminar ingesta de agua');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al agregar o eliminar ingesta de agua:', error);
      throw error;
    }
  };