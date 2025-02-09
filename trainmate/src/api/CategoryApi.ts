import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

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

export const getCategories = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/category/get-categories`, {
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
        const retryResponse = await fetch(`${BASE_URL}/api/category/get-categories`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al obtener las categorías');
        }
  
        const retryData = await retryResponse.json();
        return retryData.categories;
      }
  
      // Si no es 401, seguimos con el flujo normal
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener las categorías');
      }
  
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      throw error;
    }
  };

  export const saveCategory = async (categoryData: { name: string, icon: string }) => {
    
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    const modifiedCategoryData = { ...categoryData, isCustom: true };

    try {
      const response = await fetch(`${BASE_URL}/api/category/save-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(modifiedCategoryData),
      });
  
      // Si la respuesta es 401, intentamos renovar el token
      if (response.status === 403 || response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/category/save-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify(modifiedCategoryData),
        });
  
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || 'Error al guardar la categoría');
        }
  
        const retryData = await retryResponse.json();
        return retryData.category;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la categoría');
      }
  
      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      throw error;
    }
  };

  export const editCategory = async (categoryData: { name: string, icon: string }, category_id: string) => {
        
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');

    try {
    const response = await fetch(`${BASE_URL}/api/category/edit-category/${category_id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        },
        body: JSON.stringify(categoryData),
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/category/edit-category/${category_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
        },
        body: JSON.stringify(categoryData),
        });

        if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al editar categoría');
        }

        const success = await retryResponse.json();
        return success;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al editar categoría');
    }

    const success = await response.json();
    return success;
    } catch (error) {
    console.error('Error al editar categoría:', error);
    throw error;
    }
}

export const deleteCategory = async (category_id: string, trainings: any) => {
  // Primero hago validacion de que la categoría no tenga ejercicios que se encuentren en entrenamientos
  const exercisesInTrainings = trainings.some((training: any) => training.exercises.some((exercise: any) => exercise.category_id === category_id));
  console.log(exercisesInTrainings);
  if (exercisesInTrainings) {
    throw new Error('No se puede eliminar la categoría porque tiene ejercicios que se encuentran en entrenamientos');
  }
  else {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');

    try {
    const response = await fetch(`${BASE_URL}/api/category/delete-category/${category_id}`, {
        method: 'DELETE',
        headers: {
        'Authorization': token,
        },
    });

    // Si la respuesta es 401, intentamos renovar el token
    if (response.status === 403 || response.status === 401) {
        console.log('Token expirado, intentando renovar...');
        const newToken = await refreshAuthToken(); // Renueva el token
        // Intentamos la solicitud de nuevo con el nuevo token
        const retryResponse = await fetch(`${BASE_URL}/api/category/delete-category/${category_id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${newToken}`,
        },
        });

        if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        throw new Error(errorData.error || 'Error al eliminar categoría');
        }

        const success = await retryResponse.json();
        return success;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar categoría');
    }

    const success = await response.json();
    return success;
    } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error;
    }
  }
}

  export const getLastModifiedCategoryTimestamp = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/category/last-modified`, {
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
        const retryResponse = await fetch(`${BASE_URL}/api/category/last-modified`, {
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

  export const updateLastModifiedCategoryTimestamp = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${BASE_URL}/api/category/update-last-modified`, {
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
        const retryResponse = await fetch(`${BASE_URL}/api/category/update-last-modified`, {
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