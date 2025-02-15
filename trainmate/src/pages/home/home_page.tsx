import React, { useEffect, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Brush, Legend } from 'recharts';
import Typography from '@mui/material/Typography';
import ScrollArea from '@mui/material/Box';
import { getLastModifiedWorkoutsTimestamp, getWorkouts, saveWorkout, updateLastModifiedWorkoutsTimestamp } from '../../api/WorkoutsApi';
import { calculate_calories_and_duration_per_day } from '../../functions/calculations';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { getCategories, getLastModifiedCategoryTimestamp } from '../../api/CategoryApi';
import { getExerciseFromCategory } from '../../api/ExerciseApi';
import { getCoaches } from '../../api/CoachesApi_external';
import { FilterTrainingDialog } from './filter_training';
import { Divider } from '@mui/material';
import { top_exercises_done } from '../../functions/top_exercises_done';
import DynamicBarChart from './bars_graph';
import { getTrainings, getLastModifiedTrainingsTimestamp } from '../../api/TrainingApi';
import { FilterCoachDialog } from './filter_coach';
import WaterIntakeCard from './water_intake';
import ResponsiveMenu from './menu_responsive';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import '../../App.css';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import { getFilteredData } from './dates_filter';
import { getChallenges } from '../../api/ChallengesApi';
import ChallengeModal from '../../personalizedComponents/challengeModal';
import WorkspacePremiumTwoToneIcon from '@mui/icons-material/WorkspacePremiumTwoTone';
import { calculate_last_30_days_calories_progress } from '../../functions/progress_calories_calcs';
import Last30DaysProgress from './last30daysCaloriesProgress';
import { subDays, format } from 'date-fns';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Last30DaysCalendar from './last30daysCalendar';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { handleNumberKeyPressWithoutDecimals } from '../../functions/numeric_key_press';

dayjs.extend(isSameOrAfter);

interface Workout {
  id: number;
  duration: number;
  date: string;
  total_calories: number;
  coach: string;
  training: Training;
  training_id: string;
}

interface Training {
  calories_per_hour_mean: number;
  exercises: Exercise[];
  name: string;
  owner: string;
}

interface Category {
  id: string;
  icon: string;
  name: string;
  owner: string;
  isCustom: boolean;
}

interface Exercise {
  id: string;
  calories_per_hour: number;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
  training_muscle: string;
}

interface CategoryWithExercises {
  id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
  exercises: Exercise[];
}

interface ExerciseCount {
  exerciseId: string;
  name: string;
  count: number;
}

interface topCategoriesWithExercises {
  categoryId: string;
  categoryName: string;
  totalCount: number;
  exercises: ExerciseCount[];
}

interface Trainings {
  id: string;
  name: string;
  owner: string;
  calories_per_hour_mean: number;
  exercises: Exercise[];
}

interface Challenges {
  id: number;
  challenge: string;
  state: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'WEEKLY' | 'TWO_WEEKS'>('WEEKLY');
  const [rangeIndex, setRangeIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [alertWorkoutAddedOpen, setAlertWorkoutAddedOpen] = useState(false);
  const [alertWorkoutAddedForAgendaOpen, setAlertWorkoutAddedForAgendaOpen] = useState(false);
  const [alertWorkoutFillFieldsOpen, setAlertWorkoutFillFieldsOpen] = useState(false);
  const [workoutList, setWorkoutList] = useState<Workout[]>([]);
  const [caloriesPerDay, setCaloriesPerDay] = useState<{ [date: string]: [number, number] }>({});
  const [loading, setLoading] = useState(true);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [openWorkoutAdding, setOpenWorkoutAdding] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [coaches, setCoaches] = useState([]);
  const [coachSelected, setCoachSelected] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTrainingOpen, setFilterTrainingOpen] = useState(false);
  const [filterCoachOpen, setFilterCoachOpen] = useState(false);
  const [selectedTrainingInFilter, setSelectedTrainingInFilter] = useState<Trainings | null>(null);
  const [selectedCoachInFilter, setSelectedCoachInFilter] = useState<string>('');
  const [categoryWithExercises, setCategoryWithExercises] = useState<CategoryWithExercises[]>([]);
  const [topExercisesDone, setTopExercisesDone] = useState<topCategoriesWithExercises[]>([]);
  const [trainings, setTrainings] = useState<Trainings[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Trainings | null>(null);
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [challengesList, setChallengesList] = useState<Challenges[]>([])

  const handleChallengeModalClose = () => {
    setChallengeModalOpen(false)
  }

  const getChallengesList = async () => {
    try {
      const challenges = await getChallenges('workouts');
      setChallengesList(challenges)
    }
    catch (error) {
      console.error('Error al obtener challenges:', error);
    }
  }

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
  }

  const getAllWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      // Obtén la fecha actual (hoy) en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      // Llama a getWorkouts solo con el endDate como hoy
      const workouts = await getWorkouts(token, undefined, today);
      return Array.isArray(workouts) ? workouts : [];
    } catch (error) {
      console.error('Error al obtener todos los entrenamientos:', error);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateWithoutYear = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatDataForChart = () => {
    return Object.keys(caloriesPerDay)
      .map((date) => ({
        date: formatDate(date),
        timestamp: new Date(date).getTime(),
        Calories: caloriesPerDay[date][0],
        Minutes: caloriesPerDay[date][1],
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const dataForChart = useMemo(() => formatDataForChart(), [caloriesPerDay]);

  const last30DaysData = useMemo(() => calculate_last_30_days_calories_progress(dataForChart), [dataForChart]);

  const [newWorkout, setNewWorkout] = useState({
    training_id: '',
    duration: '',
    coach: '',
    date: null as Dayjs | null,
  });

  useEffect(() => {
    const updateTimeRange = () => {
      setTimeRange(window.innerWidth < 768 ? 'WEEKLY' : 'TWO_WEEKS');
    };
    updateTimeRange();
    window.addEventListener('resize', updateTimeRange);
    return () => window.removeEventListener('resize', updateTimeRange);
  }, []);

  const daysForPeriod = timeRange === 'WEEKLY' ? 7 : 14;

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const computedEnd = subDays(today, rangeIndex * daysForPeriod);
    const computedStart = subDays(computedEnd, daysForPeriod - 1);

    return { startDate: computedStart, endDate: computedEnd };
  }, [rangeIndex, daysForPeriod]);

  const filteredData = useMemo(() => {
    return getFilteredData(dataForChart, startDate, endDate);
  }, [dataForChart, startDate, endDate]);

  const handlePrevRange = () => {
    setRangeIndex(prev => prev + 1);
  };

  const handleNextRange = () => {
    setRangeIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterOpen = () => {
    setFilterOpen(true);
  }

  const handleFilterClose = () => {
    setFilterOpen(false);
  }

  const handleGoToNewTraining = () => {
    navigate('/categories');
  }

  const handleFilterTrainingClose = (selectedTraining: { id: string }) => {
    setFilterTrainingOpen(false);

    if (selectedTraining) {
      let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

      if (selectedCoachInFilter) {
        allWorkoutsList = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoachInFilter);
      }

      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTraining?.id);

      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    }
  };

  const handleFilterCoachClose = (selectedCoach: string) => {
    setFilterCoachOpen(false);

    if (selectedCoach) {
      let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

      if (selectedTrainingInFilter) {
        allWorkoutsList = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTrainingInFilter.id);
      }

      let filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoach);
      if (selectedCoach === 'No coach') {
        filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.coach === '');
      }

      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    }
  };

  const handleCloseOfTrainingFilterLabel = () => {
    setSelectedTrainingInFilter(null);
    let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

    if (selectedCoachInFilter) {
      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.coach === selectedCoachInFilter);

      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    } else {
      const calories_duration_per_dayList = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
      setWorkoutList(allWorkoutsList);
      setCaloriesPerDay(calories_duration_per_dayList);
    }
  };

  const handleCloseOfCoachFilterLabel = () => {
    setSelectedCoachInFilter('');
    let allWorkoutsList = JSON.parse(localStorage.getItem('workouts') || '[]');

    if (selectedTrainingInFilter) {
      const filteredWorkouts = allWorkoutsList.filter((workout: Workout) => workout.training_id === selectedTrainingInFilter.id);

      if (filteredWorkouts.length === 0) {
        setWorkoutList([]);
        setCaloriesPerDay({});
      } else {
        const calories_duration_per_dayFiltered = calculate_calories_and_duration_per_day(filteredWorkouts);
        setWorkoutList(filteredWorkouts);
        setCaloriesPerDay(calories_duration_per_dayFiltered);
      }
    } else {
      const calories_duration_per_dayList = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
      setWorkoutList(allWorkoutsList);
      setCaloriesPerDay(calories_duration_per_dayList);
    }
  };

  const handleOpenWorkoutAdding = () => {
    setOpenWorkoutAdding(true);
    setOpen(false);
  }

  const handleCloseWorkoutAdding = () => {
    setOpenWorkoutAdding(false);
    setOpen(true);
    setSelectedCategory(null);
    setExercises([]);
    setCoachSelected('');
    setSelectedTraining(null);
    setNewWorkout({
      training_id: '',
      duration: '',
      coach: '',
      date: null as Dayjs | null,
    });
  }

  const handleAddWorkout = async () => {
    if (newWorkout.training_id && newWorkout.duration && newWorkout.date) {
      setLoadingButton(true)

      try {
        const token = localStorage.getItem('token');
        if (token) {
          await saveWorkout(token, {
            training_id: newWorkout.training_id,
            coach: newWorkout.coach,
            duration: parseInt(newWorkout.duration, 10),
            date: newWorkout.date.format('YYYY-MM-DD'),
          });

          const today = dayjs().format('YYYY-MM-DD');
          if (newWorkout.date.format('YYYY-MM-DD') > today) {
            setAlertWorkoutAddedForAgendaOpen(true);
          } else {
            setAlertWorkoutAddedOpen(true);
          }

          const updatedTimestamp = await updateLastModifiedWorkoutsTimestamp();
          localStorage.removeItem('workouts');
          localStorage.removeItem('calories_duration_per_day');
          localStorage.removeItem('workouts_timestamp');
          setWorkoutsCount((prevCount) => prevCount + 1);
          setLoadingButton(false)

        } else {
          setLoadingButton(false)
          console.error('No token found, unable to save workout');
        }
      } catch (error) {
        setLoadingButton(false)
        console.error('Error saving workout:', error);
      }

      handleCloseWorkoutAdding();
      handleClose();
    }
    else {
      setAlertWorkoutFillFieldsOpen(true);
    }
  };

  const getAllCategories = async () => {
    try {
      const categories = await getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  };

  const getAllTrainings = async () => {
    try {
      const trainings = await getTrainings();
      return Array.isArray(trainings) ? trainings : [];
    } catch (error) {
      console.error('Error al obtener los entrenamientos:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const now = Date.now();
        const TTL = 60 * 60 * 1000; // 1 hora en milisegundos (Despues de una hora, se reinicia el localStorage)

        // Step 1: Fetch Categories and Exercises
        const lastModifiedCategoriesTimestamp = await getLastModifiedCategoryTimestamp();
        const categories_from_local_storage = JSON.parse(localStorage.getItem('categories') || '[]');
        const categories_timestamp = parseInt(localStorage.getItem('categories_timestamp') || '0', 10);
        const exercises_from_local_storage = JSON.parse(localStorage.getItem('categories_with_exercises') || '[]');

        if (categories_from_local_storage.length > 0 && exercises_from_local_storage.length > 0 && lastModifiedCategoriesTimestamp === categories_timestamp) {
          setCategories(categories_from_local_storage);
          setCategoryWithExercises(exercises_from_local_storage);
        } else {
          const categories = await getAllCategories();
          let categories_with_exercises: CategoryWithExercises[] = [];

          for (const category of categories) {
            const exercises = await getExerciseFromCategory(category.id);
            categories_with_exercises = [...categories_with_exercises, { ...category, exercises }];
          }

          setCategories(categories);
          setCategoryWithExercises(categories_with_exercises);

          localStorage.setItem('categories_with_exercises', JSON.stringify(categories_with_exercises));
          localStorage.setItem('categories', JSON.stringify(categories));
          localStorage.setItem('categories_timestamp', lastModifiedCategoriesTimestamp);
        }

        // Step 2: Fetch Workouts
        const lastModifiedWorkoutsTimestamp = await getLastModifiedWorkoutsTimestamp();
        const localWorkoutTimestamp = parseInt(localStorage.getItem('workouts_timestamp') || '0', 10);
        const workouts_from_local_storage = JSON.parse(localStorage.getItem('workouts') || '[]');

        const calories_duration_per_day_from_local_storage = JSON.parse(localStorage.getItem('calories_duration_per_day') || '{}');
        let sortedWorkouts = workouts_from_local_storage;

        if (workouts_from_local_storage.length > 0 && Object.keys(calories_duration_per_day_from_local_storage).length > 0 && (lastModifiedWorkoutsTimestamp === localWorkoutTimestamp)) {
          setWorkoutList(workouts_from_local_storage);
          setCaloriesPerDay(calories_duration_per_day_from_local_storage);
        } else {
          const workouts = await getAllWorkouts();
          const validWorkouts = workouts.filter((workout: Workout) => workout.duration && workout.date && workout.total_calories);
          sortedWorkouts = validWorkouts.sort((a: Workout, b: Workout) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setWorkoutList(sortedWorkouts);

          const calories_duration_per_day = calculate_calories_and_duration_per_day(sortedWorkouts);
          setCaloriesPerDay(calories_duration_per_day);

          localStorage.setItem('workouts', JSON.stringify(sortedWorkouts));
          localStorage.setItem('workouts_timestamp', lastModifiedWorkoutsTimestamp);
          localStorage.setItem('calories_duration_per_day', JSON.stringify(calories_duration_per_day));
        }

        // Step 3: Fetch Coaches
        const coaches_from_local_storage = JSON.parse(localStorage.getItem('coaches') || '[]');
        const coaches_timestamp = parseInt(localStorage.getItem('coaches_timestamp') || '0', 10);

        if (coaches_from_local_storage.length > 0 && (now - coaches_timestamp < TTL)) {
          setCoaches(coaches_from_local_storage);
        } else {
          const coaches = await getCoaches();
          setCoaches(coaches);
          localStorage.setItem('coaches', JSON.stringify(coaches));
          localStorage.setItem('coaches_timestamp', Date.now().toString());
        }

        // Step 4: Fetch Trainings
        const lastModifiedTrainingTimestamp = await getLastModifiedTrainingsTimestamp();
        const localTrainingTimestamp = parseInt(localStorage.getItem('trainings_timestamp') || '0', 10);
        const storedTrainings = JSON.parse(localStorage.getItem('trainings') || '[]');
        if (lastModifiedTrainingTimestamp && storedTrainings.length > 0 && lastModifiedTrainingTimestamp === localTrainingTimestamp) {
          setTrainings(storedTrainings);
        } else {
          const trainings = await getAllTrainings();
          if (trainings) {
            setTrainings(trainings);
            localStorage.setItem('trainings', JSON.stringify(trainings));
            localStorage.setItem('trainings_timestamp', lastModifiedTrainingTimestamp);
          }
        }

        // Step 5: Fetch Challenges
        getChallengesList();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workoutsCount]); // Re-run only if workoutsCount changes

  useEffect(() => {
    const top_exercises_done_for_graph = top_exercises_done(workoutList, categoryWithExercises);
    setTopExercisesDone(top_exercises_done_for_graph.topCategoriesWithExercises);
  }, [workoutList]);

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 text-white">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar
            alt="User"
            src={require('../../images/profile_pic_2.jpg')}
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer', marginRight: '12px' }}
          />
          <img src={require('../../images/logo.png')} alt="Logo" width={200} height={150} />
        </div>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
          {loading ? <></> : (<ResponsiveMenu handleFilterOpen={handleFilterOpen} handleClickOpen={handleClickOpen} />)}
        </Box>
      </header>
      <TopMiddleAlert alertText='Added workout successfully' open={alertWorkoutAddedOpen} onClose={() => setAlertWorkoutAddedOpen(false)} severity='success' />
      <TopMiddleAlert alertText='Added workout in Agenda successfully' open={alertWorkoutAddedForAgendaOpen} onClose={() => setAlertWorkoutAddedForAgendaOpen(false)} severity='success' />
      <TopMiddleAlert alertText='Please fill in all the fields' open={alertWorkoutFillFieldsOpen} onClose={() => setAlertWorkoutFillFieldsOpen(false)} severity='warning' />

      {challengeModalOpen &&
        <ChallengeModal pageName='Workouts Challenges' listOfChallenges={challengesList} open={challengeModalOpen} handleClose={handleChallengeModalClose} />
      }

      {/* FILTER PRINCIPAL */}
      <Dialog open={filterOpen} onClose={handleFilterClose}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-around" alignItems="center" mt={2} >
            <Box textAlign="center" mr={{xs: 3, sm: 5}}>
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900] }} onClick={() => setFilterTrainingOpen(true)} variant="contained">Training</Button>
            </Box>
            <Box textAlign="center" >
              <Button sx={{ backgroundColor: grey[700], borderColor: grey[900] }} onClick={() => setFilterCoachOpen(true)} variant="contained">Coach</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <FilterTrainingDialog filterTrainingOpen={filterTrainingOpen} handleFilterTrainingClose={handleFilterTrainingClose} selectedTrainingInFilter={selectedTrainingInFilter}
        setSelectedTrainingInFilter={setSelectedTrainingInFilter} trainings={trainings} handleFilterClose={handleFilterClose} />

      <FilterCoachDialog filterCoachOpen={filterCoachOpen} handleFilterCoachClose={handleFilterCoachClose} selectedCoachInFilter={selectedCoachInFilter}
        setSelectedCoachInFilter={setSelectedCoachInFilter} coaches={coaches} handleFilterClose={handleFilterClose} />

      <Dialog open={open} onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
            width: '100%',
            height: 'auto',
            '@media (max-width: 1024px)': {
              padding: 1,
              maxWidth: '60vw',
            },
            '@media (max-width: 600px)': {
              padding: 1,
              maxWidth: '100vw',
            },
          },
        }}
      >
        <DialogActions>
          <IconButton aria-label="add" onClick={handleClose}>
            <CloseIcon sx={{ color: '#fff', mt: -2, mr: -2, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' } }} className="h-8 w-8" />
          </IconButton>
        </DialogActions>

        <DialogTitle sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          mt: -4,
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
        }}>
          What do you want to add?
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mt={2} px={2}>
            <Box textAlign="center" mx={2} my={{ xs: 2, sm: 0 }}>
              <IconButton onClick={handleCategoriesClick}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Categories"
                  src={require('../../images/Sports2.png')}
                  sx={{
                    width: { xs: 120, sm: 150, md: 170 },
                    height: { xs: 120, sm: 150, md: 170 },
                  }}
                />
              </IconButton>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                New Category, Exercise or Training
              </Typography>
            </Box>

            <Box textAlign="center" mx={2} my={{ xs: 2, sm: 0 }}>
              <IconButton onClick={handleOpenWorkoutAdding}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Workout"
                  src={require('../../images/Exercise2.png')}
                  sx={{
                    width: { xs: 120, sm: 150, md: 170 },
                    height: { xs: 120, sm: 150, md: 170 },
                  }}
                />
              </IconButton>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 3 }}>
                New Workout
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={openWorkoutAdding} onClose={handleCloseWorkoutAdding}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff', // Esto ajusta el color del texto principal
            padding: 2,
            width: '100%',
          },
        }} className='border border-gray-600 rounded'>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>Add New Workout</DialogTitle>
        <DialogContent className='text-white'>

        <Box sx={{width: '100%'}} display={ 'flex' } justifyContent="space-between" alignItems="center" gap={0}>
          <Select
            fullWidth
            value={selectedTraining?.id || ""}
            onChange={(e) => { setSelectedTraining(trainings.find((training) => training.id === e.target.value) || null); setNewWorkout({ ...newWorkout, training_id: e.target.value || '' }) }}
            displayEmpty
            sx={{
              marginBottom: 1,
              color: '#fff', // Color del texto en Select
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff', // Color del borde
              },
              '& .MuiSvgIcon-root': {
                color: '#fff', // Color del ícono (flecha de selección)
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
                  color: '#fff', // Color de los textos en el menú desplegable
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Training
            </MenuItem>
            {trainings.map((training) => (
              <MenuItem key={training.id} value={training.id}>
                {training.name}
              </MenuItem>
            ))}
          </Select>
          <Box>
            <a href="#" className="underline" onClick={handleGoToNewTraining} style={{ color: 'gray' }}>
              <Typography sx={{ fontSize: '0.70rem', textAlign: 'center', mt: -1 }} variant="body2" color="white">Create New Training +</Typography>
            </a>
          </Box>
        </Box>
          
          <Box sx={{width: '100%'}} display={ 'flex' } justifyContent="space-between" alignItems="center" gap={2}>
            <Select
              fullWidth
              value={coachSelected}
              onChange={(e) => { setCoachSelected(e.target.value); setNewWorkout({ ...newWorkout, coach: e.target.value }) }}
              displayEmpty
              sx={{
                marginBottom: 0,
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
              <MenuItem value="" disabled>
                Select Coach
              </MenuItem>
              {coaches.map((coach: any) => (
                <MenuItem key={coach.fullName} value={coach.fullName}>
                  {coach.fullName}
                </MenuItem>
              ))}
            </Select>
            <Box alignContent={'center'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.56rem', textAlign: 'center' }}>From GymGenius ©</Typography>
              <img src={require('../../images/LogoGymGeniusIcon.png')} alt="Logo" width={50} height={50} />
            </Box>
          </Box>

          <TextField
            fullWidth
            margin="dense"
            label="Duration"
            value={newWorkout.duration}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setNewWorkout({ ...newWorkout, duration: "" });
              } else {
                const numericValue = parseInt(value, 10);
                if (numericValue >= 1 && numericValue <= 1000) {
                  setNewWorkout({ ...newWorkout, duration: value });
                } else if (numericValue < 1) {
                  setNewWorkout({ ...newWorkout, duration: "1" });
                } else if (numericValue > 1000) {
                  setNewWorkout({ ...newWorkout, duration: "1000" });
                }
              }
            }}
            onKeyDown={handleNumberKeyPressWithoutDecimals}
            placeholder="In minutes"
            type="number"
            InputLabelProps={{
              style: { color: '#fff' }, // Color del label (Duration)
            }}
            InputProps={{
              style: { color: '#fff' }, // Color del texto dentro del input
            }}
            slotProps={{
              htmlInput: { min: 1, max: 1000 }
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
            }}
          />
          <Box sx={{mt: 1.2}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={newWorkout.date}
                onChange={(newValue: Dayjs | null) =>setNewWorkout((prevState) => ({...prevState,date: newValue,}))}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      backgroundColor: "#444",
                      color: grey[50],
                      borderRadius: '8px',
                      label: { color: '#fff'},
                      input: { color: '#fff' },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: '#fff' },
                        "&:hover fieldset": { borderColor: 'black' },
                        "&.Mui-focused fieldset": { borderColor: grey[100] },
                      },
                    },
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": { backgroundColor: grey[800] },
                      "& .MuiPickersCalendarHeader-root": { color: grey[50] },
                      "& .MuiDayCalendar-weekDayLabel": { color: grey[400] },
                      "& .MuiPickersDay-root": { color: grey[50] },
                      "& .MuiPickersDay-root.Mui-selected": {
                        backgroundColor: '#000000 !important',
                        color: grey[50],
                        fontWeight: 'bold',
                      },
                      "& .MuiPickersDay-root.Mui-selected:hover": {
                        backgroundColor: '#000000 !important',
                      },
                      "& .MuiPickersDay-root.MuiPickersDay-today": {
                        border: `1px solid ${grey[700]}`,
                      },
                      "& .MuiPickersDay-root:hover": {
                        backgroundColor: grey[600],
                      },
                    },
                  },
                  openPickerButton: {
                    sx: {
                      color: '#fff',
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            isLoading={false}
            onClick={handleCloseWorkoutAdding}
            label="CANCEL"
            icon={<></>}
            borderColor="border-transparent"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-white"
          />
          <LoadingButton
            isLoading={loadingButton}
            onClick={handleAddWorkout}
            label="ADD NEW WORKOUT"
            icon={<></>}
            borderColor="border-transparent"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-white"
          />
        </DialogActions>
      </Dialog>

      {loading ? (
        <LoadingAnimation />
      ) : (
        <main className="p-4 space-y-6">
          <Card sx={{ backgroundColor: '#161616', color: '#fff' }} className='border border-gray-600' >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardHeader title="Workouts progress" sx={{ ml: 2, mt:-2}}/>
              <Box display="flex" justifyContent="center" alignItems="center" gap={3} sx={{mt: 2}}>
                <Last30DaysCalendar dataForChart={dataForChart}/>
                  <Box sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setChallengeModalOpen(true)}>
                    <WorkspacePremiumTwoToneIcon sx={{ fontSize: 50, mr: 2 }} style={{ color: '#AE8625' }}/>
                    <Typography sx={{mr: 2, mb: 0, mt: 1}} style={{ color: '#AE8625'}}>Challenges</Typography>
                  </Box>
                </Box>
            </div>
            <CardContent>

              <Box display="flex" justifyContent="center" alignItems="center" mb={1} sx={{ mt: { xs: 2, sm: -5, lg:-5 } }}>
                <IconButton onClick={handlePrevRange}>
                  <ArrowBack sx={{color: '#fff'}}/>
                </IconButton>
                <Typography variant="h6" sx={{ mx: 1 }}>
                  {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM')}
                </Typography>
                <IconButton onClick={handleNextRange} disabled={rangeIndex === 0}>
                  <ArrowForward sx={{color: rangeIndex===0 ? 'grey' : '#fff'}}/>
                </IconButton>
                <Button variant="outlined" onClick={() => setRangeIndex(0)} disabled={rangeIndex === 0} 
                  sx={{
                    fontSize: 12,
                    ml: 2,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-disabled': {
                      color: 'gray',
                      borderColor: 'gray',
                    },
                  }}>
                  Today
                </Button>
              </Box>

              {(selectedTrainingInFilter && selectedTrainingInFilter.name) ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: grey[700],
                    borderRadius: '8px',
                    padding: 2,
                    marginBottom: 2,
                    height: 50,
                    width: 'auto',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    marginRight: 2
                  }}
                >
                  <Typography variant="h6" noWrap>{selectedTrainingInFilter?.name}</Typography>
                  <IconButton aria-label="add" onClick={() => handleCloseOfTrainingFilterLabel()}>
                    <CloseIcon sx={{ color: grey[900], fontSize: 20 }} className="h-12 w-12" />
                  </IconButton>
                </Box>
              ) : (
                <Box></Box>
              )}

              {(selectedCoachInFilter) ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: grey[700],
                    borderRadius: '8px',
                    padding: 2,
                    marginBottom: 2,
                    height: 50,
                    width: 'auto',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="h6" noWrap>{selectedCoachInFilter}</Typography>
                  <IconButton aria-label="add" onClick={() => handleCloseOfCoachFilterLabel()}>
                    <CloseIcon sx={{ color: grey[900], fontSize: 20 }} className="h-12 w-12" />
                  </IconButton>
                </Box>
              ) : (
                <Box></Box>
              )}

              <ResponsiveContainer width="100%" height={440}>
                {filteredData && filteredData.length > 0 ? (
                  <LineChart data={filteredData} margin={{ top: 10, right: 0, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#fff" tick={{ dy: 13 }} tickFormatter={(tick) => {
                      const [day, month] = tick.split('/'); 
                      return `${day}/${month}`;
                    }}/>
                    <YAxis stroke="#E43654" yAxisId="left" tick={{ fontWeight: 'bold' }} />
                    <YAxis stroke="#44f814" orientation="right" yAxisId="right" tick={{ fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }} />
                    <Legend verticalAlign="top" height={50} wrapperStyle={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}/>
                    <Line type="monotone" dataKey="Calories" stroke="#E43654" activeDot={{ r: 10 }} yAxisId="left" />
                    <Line type="monotone" dataKey="Minutes" stroke="#44f814" activeDot={{ r: 10 }} yAxisId="right" />
                    <Brush dataKey="date" height={30} stroke="#000000" y={400} fill="#161616" travellerWidth={10}
                      className="custom-brush"
                      traveller={(props) => {
                        const { x, y, width, height } = props;
                        return (
                          <g>
                            {/* Traveller rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill="#fff"
                              stroke="none"
                              style={{ outline: 'none' }}
                              tabIndex={-1}
                            />
                            {/* First horizontal line */}
                            <line
                              x1={x + 2}
                              y1={y + height / 2 - 1}
                              x2={x + width - 2}
                              y2={y + height / 2 - 1}
                              stroke="#808080"
                              strokeWidth={1}
                              style={{ outline: 'none' }}
                              tabIndex={-1}
                            />
                            {/* Second horizontal line */}
                            <line
                              x1={x + 2}
                              y1={y + height / 2 + 1}
                              x2={x + width - 2}
                              y2={y + height / 2 + 1}
                              stroke="#808080"
                              strokeWidth={1}
                              style={{ outline: 'none' }}
                              tabIndex={-1}
                            />
                          </g>
                        );
                      }} />
                    <text x="50%" y={420} fill="#ffffff" textAnchor="middle" fontSize="12px" >Filter date</text>
                  </LineChart>
                ) : (
                  <div>
                    <Typography variant="body2" color="gray">No progress available</Typography>
                    <a href="#" className="underline" onClick={handleClickOpen}>
                      <Typography sx={{ marginTop: 4 }} variant="body2" color="gray">Add new workout</Typography>
                    </a>

                  </div>
                )}
              </ResponsiveContainer>
              <Last30DaysProgress last30DaysData={last30DaysData} />
            </CardContent>
          </Card>
          <Box sx={{ display: 'flex', height: '100%', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardHeader title="Workouts" />
              </div>
              <CardContent>
                <ScrollArea sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {Array.isArray(workoutList) && workoutList.length > 0 ? (
                    workoutList.map((workout: any) => (
                      <div key={workout.id} className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                          <Divider sx={{ backgroundColor: 'gray', marginY: 1 }} />
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'row' }, justifyContent: 'space-between', width: '100%', marginBottom: 1 }}>
                            <Typography variant="h6" color="#81d8d0" sx={{ flex: 1, fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' } }}>{workout.training.name}</Typography>
                            <Typography variant="h6" color='#44f814' sx={{ flex: 1, textAlign: 'left', fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' } }}>{workout.duration} min</Typography>
                            <Typography variant="h6" color='#E43654' sx={{ flex: 1, textAlign: 'left', fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' } }}>{workout.total_calories} kcal</Typography>
                            <Typography variant="subtitle1" color='gray' sx={{ flex: 1, textAlign: 'right', fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}>{formatDateWithoutYear(workout.date)} </Typography>
                          </Box>
                          <Typography variant="body2">
                            {workout.training.exercises.map((exercise: any, index: number) => (
                              <span key={exercise.id}>
                                {exercise.name}
                                {index < workout.training.exercises.length - 1 && ' - '}
                              </span>
                            ))}
                          </Typography>
                          <Typography variant="body2" color="gray">Coach: {workout.coach ? workout.coach : '-'}</Typography>
                        </div>
                      </div>
                      
                    ))
                  ) : (
                    <Typography variant="body2" color="gray">No workouts available</Typography>
                  )}
                  {workoutList.length > 0 ? (<Divider sx={{ backgroundColor: 'gray', marginY: 1 }} />) : (<></>)}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
              <CardHeader title="Top Categories & Exercises done" />
              <CardContent>
                {Array.isArray(topExercisesDone) && topExercisesDone.length > 0 ? (
                  <DynamicBarChart topExercisesDone={topExercisesDone} />
                ) : (
                  <Typography variant="body2" color="gray">No workouts available</Typography>
                )}
              </CardContent>
            </Card>

            <WaterIntakeCard />
          </Box>
        </main>
      )}
    </div>
  );
}