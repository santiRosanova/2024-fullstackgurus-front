import { BASE_URL } from "../constants";
import { refreshAuthToken } from "../utils/AuthUtils";

const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
};

export interface Goal {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    completed: boolean;
}

export const saveGoal = async (goalData: { title: string; description: string; startDate: string; endDate: string }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const formattedGoalData = {
        ...goalData,
        startDate: goalData.startDate ? new Date(goalData.startDate).toISOString().split('T')[0] : null,
        endDate: goalData.endDate ? new Date(goalData.endDate).toISOString().split('T')[0] : null,
    };

    try {
        const response = await fetch(`${BASE_URL}/api/goals/create-goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(formattedGoalData),
        });

        if (response.status === 403 || response.status === 401) {
            const newToken = await refreshAuthToken();
            const retryResponse = await fetch(`${BASE_URL}/api/goals/create-goal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newToken}`,
                },
                body: JSON.stringify(formattedGoalData),
            });

            if (!retryResponse.ok) {
                const errorData = await retryResponse.json();
                throw new Error(errorData.error || 'Error saving goal');
            }
            return await retryResponse.json();
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error saving goal');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving goal:', error);
        throw error;
    }
};


export const getGoals = async (startDate?: string, endDate?: string): Promise<Goal[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('Token not found');

    const url = new URL(`${BASE_URL}/api/goals/get-all-goals`);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    });

    if (response.status === 403 || response.status === 401) {
        const newToken = await refreshAuthToken();
        const retryResponse = await fetch(`${BASE_URL}/api/goals/get-all-goals`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });

        if (!retryResponse.ok) {
            const errorData = await retryResponse.json();
            throw new Error(errorData.error || 'Error saving goal');
        }
        return await retryResponse.json();
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error fetching goals');
    }

    const goals = await response.json();
    return goals as Goal[];
};



export const completeGoal = async (token: string, goalId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/goals/complete-goal/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error completing the goal');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error completing the goal:', error);
      throw error;
    }
  };