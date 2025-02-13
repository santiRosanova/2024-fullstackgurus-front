import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

export const saveWorkout = async (token: string, workoutData: { training_id: string, coach: string, duration: number, date: string }) => {
  try {

    console.log(workoutData.date)
    const response = await fetch(`${BASE_URL}/api/workouts/save-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
      console.log('Token expirado, intentando renovar...');
      const newToken = await refreshAuthToken(); // Renueva el token
      // Intentamos la solicitud de nuevo con el nuevo token
      const retryResponse = await fetch(`${BASE_URL}/api/workouts/save-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
        body: JSON.stringify(workoutData),
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al guardar el entrenamiento');
      }

      const retryData = await retryResponse.json();
      return retryData;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al guardar el entrenamiento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al guardar el entrenamiento:', error);
    throw error;
  }
};


export const getWorkouts = async (token: string, startDate?: string, endDate?: string) => {
  try {
    let query = '';
    if (startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
    } else if (startDate) {
      query = `?startDate=${startDate}`;
    } else if (endDate) {
      console.log(endDate)
      query = `?endDate=${endDate}`;
    }

    const response = await fetch(`${BASE_URL}/api/workouts/workouts${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
      console.log('Token expirado, intentando renovar...');
      const newToken = await refreshAuthToken(); // Renueva el token
      // Intentamos la solicitud de nuevo con el nuevo token
      const retryResponse = await fetch(`${BASE_URL}/api/workouts/workouts${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al obtener los entrenamientos');
      }

      const retryData = await retryResponse.json();
      return retryData.workouts;
    }

    // Si no es 401, seguimos con el flujo normal
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener los entrenamientos');
    }

    const data = await response.json();
    return data.workouts;
  } catch (error) {
    console.error('Error al obtener los entrenamientos:', error);
    throw error;
  }
};


export const getWorkoutsCalories = async (token: string, startDate?: string, endDate?: string) => {
  try {
    // Construir la query string basada en la presencia de startDate y endDate
    let query = '';
    
    // Si no se proporciona el endDate, se utiliza la fecha actual
    const today = new Date().toISOString().split('T')[0];
    endDate = endDate || today;

    if (startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
    } else if (startDate) {
      query = `?startDate=${startDate}`;
    } else if (endDate) {
      query = `?endDate=${endDate}`;
    }

    const response = await fetch(`${BASE_URL}/api/workouts/get-workouts-calories${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
      console.log('Token expirado, intentando renovar...');
      const newToken = await refreshAuthToken(); // Renueva el token
      // Intentamos la solicitud de nuevo con el nuevo token
      const retryResponse = await fetch(`${BASE_URL}/api/workouts/get-workouts-calories${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al obtener las calorías de los entrenamientos');
      }

      const retryData = await retryResponse.json();
      return retryData;
    }

    // Si no es 401, seguimos con el flujo normal
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener las calorías de los entrenamientos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener las calorías de los entrenamientos:', error);
    throw error;
  }
};


export const cancelWorkout = async (token: string, workoutId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/workouts/cancel-workout/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 403 || response.status === 401) {
      console.log('Token expired, attempting to renew...');
      const newToken = await refreshAuthToken();
      const retryResponse = await fetch(`${BASE_URL}/api/workouts/cancel-workout/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error cancelling workout');
      }

      const retryData = await retryResponse.json();
      return retryData;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error cancelling workout');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling workout:', error);
    throw error;
  }
};

  export const getLastModifiedWorkoutsTimestamp = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/workouts/last-modified`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    // Si la respuesta es 403, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/workouts/last-modified`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al obtener la fecha de modificación');
        }
  
        const retryData = await retryResponse.json();
        return retryData.last_modified_timestamp;
      }
  
      // Si no es 401, seguimos con el flujo normal
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la fecha de modificación');
      }
  
      const data = await response.json();
      return data.last_modified_timestamp;
    } catch (error) {
      console.error('Error al obtener la fecha de modificación:', error);
      throw error;
    }
  }

  export const updateLastModifiedWorkoutsTimestamp = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/workouts/update-last-modified`, {
      method: 'POST',
      headers: {
        'Authorization': token
      }
    });

    // Si la respuesta es 403, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/workouts/update-last-modified`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al actualizar la fecha de modificación');
        }
  
        const retryData = await retryResponse.json();
        return retryData.last_modified_timestamp;
      }
  
      // Si no es 401, seguimos con el flujo normal
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la fecha de modificación');
      }
  
      const data = await response.json();
      return data.last_modified_timestamp;
    } catch (error) {
      console.error('Error al actualizar la fecha de modificación:', error);
      throw error;
    }
  }