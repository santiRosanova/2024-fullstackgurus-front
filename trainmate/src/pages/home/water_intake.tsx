import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, IconButton, Button, Typography, CircularProgress, Box } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import { addWaterIntake, getWaterIntakeHistory } from '../../api/WaterIntakeApi';

const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WaterIntakeCard: React.FC = () => {
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(formatDateToYYYYMMDD(new Date())); 
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const dailyGoal = 2000;

  const todayDate = formatDateToYYYYMMDD(new Date()); // Current date for comparison


  const fetchDailyWaterIntake = async () => {
    try {
      const startDate = currentDate;
      const endDate = currentDate;

      const data = await getWaterIntakeHistory(startDate, endDate);

      if (data.water_intake_history.length > 0) {
        setWaterIntake(data.water_intake_history[0].quantity_in_militers || 0);
      } else {
        setWaterIntake(0);
      }
    } catch (error) {
      console.error('Error al obtener la ingesta diaria de agua', error);
    }
  };

  const addWater = async () => {
    if (currentDate === todayDate) { // Only allow if today
      setLoadingAdd(true);
      try {
        await addWaterIntake(currentDate, 150);
        setWaterIntake(prevIntake => prevIntake + 150);
      } finally {
        setLoadingAdd(false);
      }
    }
  };

  const removeWater = async () => {
    if (currentDate === todayDate && waterIntake >= 150) { // Only allow if today
      setLoadingRemove(true);
      try {
        await addWaterIntake(currentDate, -150);
        setWaterIntake(prevIntake => Math.max(prevIntake - 150, 0));
      } finally {
        setLoadingRemove(false);
      }
    }
  };

  const handlePrevDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const prevDate = new Date(year, month - 1, day - 1); 
    setCurrentDate(formatDateToYYYYMMDD(prevDate));
  };

  const handleNextDay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day + 1);
    setCurrentDate(formatDateToYYYYMMDD(nextDate)); 
  };

  useEffect(() => {
    fetchDailyWaterIntake();
  }, [currentDate]);

  const intakePercentage = Math.min((waterIntake / dailyGoal) * 100, 100); // porcentaje para la barra de progreso

  return (
    <Card sx={{ flex: 1, backgroundColor: '#161616', color: '#fff', width: '100%' }} className='border border-gray-600'>
      <CardHeader title="Water Tracker" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <IconButton onClick={handlePrevDay}>
            <ArrowBackIcon style={{ color: '#fff' }} />
          </IconButton>
          <Typography variant="h6">
            {currentDate.split('-').slice(1).reverse().join('/')}
          </Typography>
          <IconButton onClick={handleNextDay}>
            <ArrowForwardIcon style={{ color: '#fff' }} />
          </IconButton>
        </div>

        <Box className="flex justify-center mb-4">
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={intakePercentage}
              size={150}
              thickness={4}
              style={{ color: '#0E87CC' }}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* <Typography variant="h6" component="div" color="white">
                {Math.round(intakePercentage)}%
              </Typography> */}
              <Typography variant="body2" color="grey">
                {waterIntake}ml
              </Typography>
            </Box>
          </Box>
        </Box>

        <div className="flex justify-center space-x-4">
          {/* Button with loading spinner */}
          <LoadingButton
            isLoading={loadingRemove}
            onClick={removeWater}
            label="Remove 150ml"
            icon={<RemoveIcon />}
            disabled={currentDate !== todayDate}
            tooltipMessage="You can only remove water for today's date"
            borderColor="border-red-600"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-red-500"
          />
         <LoadingButton
            isLoading={loadingAdd}
            onClick={addWater}
            label="Add 150ml"
            icon={<AddIcon />}
            disabled={currentDate !== todayDate}
            tooltipMessage="You can only add water for today's date"
            borderColor="border-green-600"
            borderWidth="border"
            bgColor="bg-transparent"
            color="text-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterIntakeCard;
