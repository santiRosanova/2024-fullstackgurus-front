import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { saveTraining } from '../../api/TrainingApi';
import handleCategoryIcon from '../../personalizedComponents/handleCategoryIcon';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import { Box, Typography } from '@mui/material';

interface Exercise {
  id: string;
  calories_per_hour: number | string;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
  training_muscle: string;
}

interface CategoryWithExercises {
  id: string;
  icon: string;
  name: string;
  owner: string;
  isCustom: boolean;
  exercises: Exercise[];
}

interface Trainings {
  id: string;
  name: string;
  owner: string;
  calories_per_hour_mean: number;
  exercises: Exercise[];
}

interface CreateTrainingDialogProps {
  createNewTraining: boolean;
  handleCloseAddTrainingDialog: () => void;
  categoryWithExercises: CategoryWithExercises[];
  setTrainings: React.Dispatch<React.SetStateAction<Trainings[]>>;
  setAlertTrainingAddedOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateTrainingDialog: React.FC<CreateTrainingDialogProps> = ({ createNewTraining, handleCloseAddTrainingDialog, categoryWithExercises, setTrainings, setAlertTrainingAddedOpen }) => {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = React.useState<{ [key: string]: string[] }>({});
  const [trainingName, setTrainingName] = React.useState<string>('');
  const [loadingButton, setLoadingButton] = React.useState<boolean>(false)

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedCategories(value as string[]);
  };

  const handleExerciseChange = (categoryId: string) => (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedExercises((prevState) => ({
      ...prevState,
      [categoryId]: value as string[],
    }));
  };

  const handleCreateTraining = async () => {
    const newTraining = {
      name: trainingName,
      exercises: Object.keys(selectedExercises).reduce((allExercises, categoryId) => {
        const exercisesInCategory = categoryWithExercises.find(cat => cat.id === categoryId)?.exercises || [];
        const selectedExerciseObjects = selectedExercises[categoryId].map(exId => exercisesInCategory.find(ex => ex.id === exId)!);
        return [...allExercises, ...selectedExerciseObjects];
      }, [] as Exercise[]),
    };
    if (newTraining && newTraining.name) {
      try {
        setLoadingButton(true)
        const training = await saveTraining(newTraining);
        const trainingWithId = { ...newTraining, id: training.id, calories_per_hour_mean: training.calories_per_hour_mean, owner: training.owner };
        setTrainings((prevTrainings) => [...prevTrainings, trainingWithId]);
        setAlertTrainingAddedOpen(true);
      } catch (error) {
        setLoadingButton(false)
        console.error('Error al guardar el entrenamiento:', error);
      }
      setLoadingButton(false)
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCategories([]);
    setSelectedExercises({});
    setTrainingName('');
    handleCloseAddTrainingDialog();
  };

  return (
    <Dialog
      open={createNewTraining}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={'xs'}
      PaperProps={{
        sx: {
          backgroundColor: grey[800],
          color: '#fff',
          borderRadius: '8px',
          padding: 2,
        },
      }}
    >
      <DialogTitle>Create New Training</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="training-name"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={trainingName}
          onChange={(e) => setTrainingName(e.target.value)}
          InputLabelProps={{
            style: { color: '#fff' }, // Color del label (Duration)
          }}
          InputProps={{
            style: { color: '#fff' }, // Color del texto dentro del input
          }}
          slotProps={{
            htmlInput: { min: 1, max: 1000 }
          }}
        />

        {/* MultiSelect para categorías */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="categories" sx={{
            color: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#fff',
            },
            '& .MuiSvgIcon-root': {
              color: '#fff',
            }
          }}>Categories</InputLabel>
          <Select
            labelId="categories"
            id="categories"
            label="Categories"
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            renderValue={(selected) => (selected as string[]).map(catId => {
              const category = categoryWithExercises.find(c => c.id === catId);
              return category ? category.name : '';
            }).join(', ')}

            sx={{
              marginBottom: 1,
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
              '& .MuiSvgIcon-root': {
                color: '#fff',
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            {categoryWithExercises.map((category) => (
              <MenuItem key={category.id} value={category.id} sx={{color: category.name == 'Recovery and Stretching' ? '#63a355' : '#fff'}}>
                <Checkbox checked={selectedCategories.indexOf(category.id) > -1} />
                {handleCategoryIcon(category.icon)}
                <ListItemText primary={category.name} sx={{ ml: 1 }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Mostrar MultiSelect de ejercicios según las categorías seleccionadas */}
        {selectedCategories.map((categoryId) => (
          <FormControl key={categoryId} fullWidth sx={{ mt: 2 }}>
            <InputLabel id={`exercises-${categoryId}`}

              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
                '& .MuiSvgIcon-root': {
                  color: '#fff',
                }
              }}

            >Exercises from {categoryWithExercises.find(cat => cat.id === categoryId)?.name}</InputLabel>
            <Select
              labelId={`exercises-${categoryId}`}
              id={`exercises-${categoryId}`}
              label={`Exercises from ${categoryWithExercises.find(cat => cat.id === categoryId)?.name || "category"}`}
              multiple
              value={selectedExercises[categoryId] || []}
              onChange={handleExerciseChange(categoryId)}
              renderValue={(selected) => (selected as string[]).map(exerciseId => {
                const category = categoryWithExercises.find(cat => cat.id === categoryId);
                const exercise = category?.exercises.find(ex => ex.id === exerciseId);
                return exercise ? exercise.name : '';
              }).join(', ')}
              sx={{
                marginBottom: 1,
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
                '& .MuiSvgIcon-root': {
                  color: '#fff',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    maxWidth: 300,
                    padding: 1,
                    backgroundColor: '#444',
                    color: '#fff',
                  },
                },
              }}
            >
              {categoryWithExercises.find(cat => cat.id === categoryId)?.exercises.map((exercise) => (
                <MenuItem key={exercise.id} value={exercise.id}>
                  <Checkbox checked={selectedExercises[categoryId]?.indexOf(exercise.id) > -1} />
                  <ListItemText primary={`${exercise.name} (${exercise.calories_per_hour} kcal/h)`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2}}>
          <Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '0.8rem', color: '#63a355' } }}> 
            * Remember that it is always important to add Recovery or Stretching exercises to your training
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <LoadingButton
            isLoading={false}
            onClick={handleClose}
            label="CANCEL"
            icon={<></>}
            borderColor="border-transparent"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-white"
          />
        <LoadingButton
            isLoading={loadingButton}
            onClick={handleCreateTraining}
            label="SAVE CHANGES"
            icon={<></>}
            borderColor="border-transparent"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-white"
          />
      </DialogActions>
    </Dialog>
  );
};

export default CreateTrainingDialog;