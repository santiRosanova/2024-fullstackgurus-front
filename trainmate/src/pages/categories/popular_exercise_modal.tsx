import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, CircularProgress, Box } from '@mui/material';
import { BASE_URL } from '../../constants';
import { grey } from '@mui/material/colors';

interface Exercise {
    count: number;
    exercise_id: string;
    name: string;
}

interface PopularExercisesModalProps {
    open: boolean;
    onClose: () => void;
}

const PopularExercisesModal: React.FC<PopularExercisesModalProps> = ({ open, onClose }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPopularExercises = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/trainings/popular-exercises`);
            const data = await response.json();
            setExercises(data.popular_exercises);
        } catch (error) {
            console.error("Error fetching popular exercises", error);
        } finally {
            setLoading(false);
        }
    };

    const getMaxCount = () => {
        return Math.max(...exercises.map(exercise => exercise.count), 1); // Evita división por cero.
    };

    // Llama a la API cuando el modal se abre
    useEffect(() => {
        if (open) {
            fetchPopularExercises();
        }
    }, [open]);

    return (
        <>
            {/* Modal */}
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{
                sx: {
                  backgroundColor: grey[800],
                  color: '#fff',
                  borderRadius: '8px',
                  width: '100%',
                },
              }}>
                <div> 
                <DialogTitle sx={{textAlign: 'center'}} className=' text-white'>Top 5 Popular Exercises</DialogTitle>
                <DialogContent >
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress sx={{color: '#fff'}}/>
                        </Box>
                    ) : (
                        <div className="space-y-4">
                            {exercises && exercises.length === 0 ? (
                                <p className="text-center text-gray-500">No data available.</p>
                            ) : (
                                exercises && exercises.map((exercise) => (
                                    <div key={exercise.exercise_id} className="flex items-center">
                                        <span className="w-1/4 text-sm font-medium text-white">{exercise.name}</span>
                                        <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700 relative">
                                            <div
                                                className="h-5 bg-yellow-300 rounded"
                                                style={{
                                                    width: `${(exercise.count / getMaxCount()) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-white">{exercise.count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </DialogContent>
                </div>
            </Dialog>
        </>
    );
};

export default PopularExercisesModal;
