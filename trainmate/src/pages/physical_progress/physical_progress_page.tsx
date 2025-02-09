import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Box, Typography, IconButton, TextField, Button, Card, CardContent, CardHeader, SelectChangeEvent } from '@mui/material';
import { ArrowBack as ArrowLeftIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPhysicalData, savePhysicalData } from '../../api/PhysicalDataApi';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { renderCustomizedLabel } from './customizedLabel';
import { calculate_last_30_days_physical_progress } from '../../functions/progress_physical_calcs';
import Last30DaysProgress from './last30daysPhysicalProgress';
import WorkspacePremiumTwoToneIcon from '@mui/icons-material/WorkspacePremiumTwoTone';
import { getChallenges } from '../../api/ChallengesApi';
import ChallengeModal from '../../personalizedComponents/challengeModal';

interface PhysicalData {
  date: string;
  weight: number;
  body_fat: number;
  body_muscle: number;
}

interface PhysicalDataForChart {
  date: string;
  Weight: number;
  BodyFat: number;
  BodyMuscle: number;
}

interface Challenges {
  id: number;
  challenge: string;
  state: boolean;
}

export default function PhysicalProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PhysicalData[]>([]);
  const [selectedDay, setSelectedDay] = useState<PhysicalDataForChart | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [bodyMuscle, setBodyMuscle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [alertDataAddedOpen, setAlertDataAddedOpen] = useState(false)
  const [alertFillFieldsOpen, setAlertFillFieldsOpen] = useState(false)
  const [alertIncorrectNumbersOpen, setAlertIncorrectNumbersOpen] = useState(false)
  const [alertInocrrectNumersSumOpen, setAlertIncorrectNumbersSumOpen] = useState(false)
  const [physicalDataCount, setPhysicalDataCount] = useState(0)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [challengesList, setChallengesList] = useState<Challenges[]>([])

  const handleChallengeModalClose = () => {
    setChallengeModalOpen(false)
  }

  const getChallengesList = async () => {
    try {
      const challenges = await getChallenges('physical');
      setChallengesList(challenges)
    }
    catch (error) {
      console.error('Error al obtener challenges:', error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedData = await getPhysicalData();
        setData(fetchedData);
        // Cargo el último día por defecto
        setSelectedDay({
          date: formatDate(fetchedData[fetchedData.length - 1].date),
          Weight: fetchedData[fetchedData.length - 1].weight,
          BodyFat: fetchedData[fetchedData.length - 1].body_fat,
          BodyMuscle: fetchedData[fetchedData.length - 1].body_muscle
        });

      } catch (error) {
        console.error('Error al obtener datos físicos:', error);
      } finally{
        setLoading(false);
      }
    };
    fetchData();
    getChallengesList(); // Ver si conviene llamarlo acá o en otro lado
  }, [physicalDataCount]);

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  const handleLineClick = (day: PhysicalDataForChart) => {
    setSelectedDay(day);
  };

  const handleNumericChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
    ) => {
      const { name, value } = e.target;
      const twoDecimalRegex = /^\d+(\.\d{1,2})?$/;
      let maxValue = 0;
      let minValue = 0;
      let setter: React.Dispatch<React.SetStateAction<string>>;
      if (name == 'weight') {
        maxValue = 300
        minValue = 25
        setter = setWeight
      } 
      else if (name == 'bodyFat') {
        maxValue = 150
        minValue = 1
        setter = setBodyFat
      }
      else {
        maxValue = 150
        minValue = 1
        setter = setBodyMuscle
      }
      if (value === "") {
        setter("");
      } else {
        if (!twoDecimalRegex.test(value)) {
          return;
        }
        const numericValue = parseFloat(value);
        if (numericValue >= 1 && numericValue <= maxValue)  {
          setter(value);
        } else if (numericValue < 1) {
          setter(minValue.toString());
        } else if (numericValue > maxValue) {
          setter(maxValue.toString());
        }
      }
    };

  const handleSave = async () => {
    const parsedWeight = parseFloat(weight);
    const parsedBodyFat = parseFloat(bodyFat);
    const parsedBodyMuscle = parseFloat(bodyMuscle);
    
    if (isNaN(parsedWeight) || isNaN(parsedBodyFat) || isNaN(parsedBodyMuscle)) {
      setAlertFillFieldsOpen(true)
      return;
    }

    if (parsedWeight < 25 || parsedWeight > 300 || parsedBodyFat < 1 || parsedBodyFat > 150 || parsedBodyMuscle < 1 || parsedBodyMuscle > 150) {
      setAlertIncorrectNumbersOpen(true)
      return;
    }

    if (parsedWeight < (parsedBodyFat + parsedBodyMuscle)) {
      setAlertIncorrectNumbersSumOpen(true)
      return;
    }

    try {
      setLoadingButton(true)
      await savePhysicalData({ 
        date: date, 
        weight: parsedWeight, 
        body_fat: parsedBodyFat, 
        body_muscle: parsedBodyMuscle 
      });
      console.log('Datos físicos guardados correctamente');
      setLoadingButton(false)
      setAlertDataAddedOpen(true)
      setPhysicalDataCount(physicalDataCount + 1)
      setBodyFat('');
      setBodyMuscle('');
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
  } catch (error) {
    console.error('Error al guardar datos físicos:', error);
    setLoadingButton(false)
  } finally {
    setLoadingButton(false)
  }
  };

  // Datos para el gráfico de tortas basado en el día seleccionado
  const pieData = selectedDay
    ? [
        { name: 'Body Muscle', value: parseFloat((selectedDay.BodyMuscle * 100 / selectedDay.Weight).toFixed(1)) },
        { name: 'Body Fat', value: parseFloat((selectedDay.BodyFat * 100 / selectedDay.Weight).toFixed(1)) },
        { name: 'Other', value: parseFloat(((selectedDay.Weight - selectedDay.BodyFat - selectedDay.BodyMuscle) * 100 / selectedDay.Weight).toFixed(1)) }
      ]
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };
  
  const formatDataForChart = () => {
    return data
      .map((entry) => ({
        date: formatDate(entry.date),
        timestamp: new Date(entry.date).getTime(),
        Weight: entry.weight,
        BodyFat: entry.body_fat,
        BodyMuscle: entry.body_muscle,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const dataForChart = useMemo(() => formatDataForChart(), [data]);

  const last30DaysData = useMemo(() => calculate_last_30_days_physical_progress(dataForChart), [dataForChart]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', p: 4 }}  >
      <Box component="header" sx={{ display: 'flex', flexDirection: 'row', gap: 14}}>
        <Box className="flex items-center" sx={{flex: 1, mt: -5}}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
            <img src={require('../../images/logo.png')} alt="Logo" width={200} height={150} className="hidden md:block"/>
        </Box>
        <Box sx={{flex: 1, mb: 12}}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.5rem' }, position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>Physical Progress</Typography>
        </Box>

      </Box>

      <TopMiddleAlert alertText='Added new entry successfully' open={alertDataAddedOpen} onClose={() => setAlertDataAddedOpen(false)} severity='success'/>
      <TopMiddleAlert alertText='Please fill in all the fields' open={alertFillFieldsOpen} onClose={() => setAlertFillFieldsOpen(false)} severity='warning'/>
      <TopMiddleAlert alertText='Please enter valid numbers. Weight must be a number between 25 and 300. Body Fat and Body Muscle must be between 1 and 150' open={alertIncorrectNumbersOpen} onClose={() => setAlertIncorrectNumbersOpen(false)} severity='warning'/>
      <TopMiddleAlert alertText='Please enter valid numbers. The sum of Body Fat and Body Muscle must be less than the Weight' open={alertInocrrectNumersSumOpen} onClose={() => setAlertIncorrectNumbersSumOpen(false)} severity='warning'/>

      {challengeModalOpen &&
        <ChallengeModal pageName='Physical Challenges' listOfChallenges={challengesList} open={challengeModalOpen} handleClose={handleChallengeModalClose}/>
      }

      {loading ? (
        <LoadingAnimation />
      ) : (
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'column', md: 'row' } }}>
          {/* Gráfico de Líneas */}
          <Card sx={{ flex: 2, backgroundColor: '#161616', color: '#fff'}} className='border border-gray-600'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardHeader sx={{ ml: 2}} title="Physical progress"/>
                <Box sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setChallengeModalOpen(true)}>
                  <WorkspacePremiumTwoToneIcon sx={{ fontSize: 50, mt: 2, mb: 1, mr: 2 }} style={{ color: '#AE8625' }}/>
                  <Typography sx={{mr: 2, mb: 0, mt: 0}} style={{ color: '#AE8625'}}>Challenges</Typography>
                </Box>
            </div>
            <CardContent>
              <ResponsiveContainer width="100%" height={510}>
              {Array.isArray(dataForChart) && dataForChart.length > 0 ? (
                <LineChart width={500} height={400} data={dataForChart} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                 onClick={(e) => e.activePayload && handleLineClick(e.activePayload[0].payload)} style={{ cursor: 'pointer' }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date" stroke="#fff" tick={{ dy: 13 }}/>
                  <YAxis stroke="white" tick={{ fontWeight: 'bold' }}/>
                  <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }}/>
                  <Legend verticalAlign="top" height={50} wrapperStyle={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}/>
                  <Line type="monotone" dataKey="Weight" stroke="#0088FE" activeDot={{ r: 10 }} />
                  <Line type="monotone" dataKey="BodyMuscle" stroke="#44f814" activeDot={{ r: 10 }}/>
                  <Line type="monotone" dataKey="BodyFat" stroke="#E43654" activeDot={{ r: 10 }}/>
                </LineChart>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="h6" sx={{ color: '#fff' }}>No data available</Typography>
                </Box>
              )}
              </ResponsiveContainer>
              <Last30DaysProgress last30DaysData={last30DaysData}/>
            </CardContent>
          </Card>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Gráfico de Tortas */}
            <Card sx={{backgroundColor: '#161616', color: '#fff', p: 2, height: 390 }} className='border border-gray-600'>
              <CardHeader
                title="Percentage of weight"
              />
              <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative', mt: -6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                {Array.isArray(dataForChart) && dataForChart.length > 0 ? (
                  <PieChart width={400} height={280}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderCustomizedLabel} stroke="#0088FE" strokeWidth={2} labelLine={false}>
                      <Cell key={`cell-0`} fill={"#44f814"}/>
                      <Cell key={`cell-1`} fill={"#E43654"}/>
                      <Cell key={`cell-2`} fill={"#81d8d0"}/>
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }} itemStyle={{ color: '#fff' }}/>
                    <Legend verticalAlign="top" height={50} wrapperStyle={{marginTop: 5}}/>
                  </PieChart>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="h6" sx={{ color: '#fff' }}>No data available</Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="h6" sx={{ position: 'absolute', right: { xs: 0, sm: 25, md: 25 }, top: { xs: '90%', sm: '55%', md: '55%' }, transform: 'translateY(-50%)', color: '#fff' }}>{selectedDay?.date}</Typography>
              </CardContent>
            </Card>

            {/* Formulario */}
            <Card sx={{backgroundColor: '#161616', color: '#fff', p: 2, height: 430 }} className='border border-gray-600'>
              <CardHeader
                title="New entry"
              />
              <CardContent>
                <TextField
                  label="Date"
                  type="date"
                  margin="dense"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    style: { color: '#fff' },
                  }}
                  InputProps={{
                    style: { color: '#fff' },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fff',
                    },
                  }}
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  name="weight"
                  margin="dense"
                  fullWidth
                  value={weight}
                  onChange={(e) => handleNumericChange(e)}
                  InputLabelProps={{
                    style: { color: '#fff' },
                  }}
                  InputProps={{
                    style: { color: '#fff' },
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
                <TextField
                  label="Body Muscle (kg)"
                  type="number"
                  name='bodyMuscle'
                  margin="dense"
                  fullWidth
                  value={bodyMuscle}
                  onChange={(e) => handleNumericChange(e)}
                  InputLabelProps={{
                    style: { color: '#fff' },
                  }}
                  InputProps={{
                    style: { color: '#fff' },
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
                <TextField
                  label="Body Fat (kg)"
                  type="number"
                  name='bodyFat'
                  margin="dense"
                  fullWidth
                  value={bodyFat}
                  onChange={(e) => handleNumericChange(e)}
                  InputLabelProps={{
                    style: { color: '#fff' },
                  }}
                  InputProps={{
                    style: { color: '#fff' },
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
                <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1}}>
                  <LoadingButton
                    isLoading={loadingButton}
                    onClick={handleSave}
                    label="SAVE DATA"
                    icon={<></>}
                    borderColor="border-transparent"
                    borderWidth="border"
                    bgColor="bg-transparent"
                    color="text-white"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}