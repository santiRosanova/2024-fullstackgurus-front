import { EXTERNAL_URL } from "../constants";

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};

export const getCoaches = async () => {

    const token = getAuthToken();
    if (!token) throw new Error('Token no encontrado');
    
    try {
    const response = await fetch(`${EXTERNAL_URL}/get_coach_users`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los profesores');
    }

    const data = await response.json();
    const filteredCoaches = data
      .filter((item: any) => item.type === 'coach')
      .map((coach: any) => ({
        fullName: `${coach.Name} ${coach.Lastname}`,
        uid: `${coach.uid}`,
      }));
    return filteredCoaches;
    
    } catch (error) {
      console.error('Error al obtener los profesores:', error);
      throw error;
    }
  };
