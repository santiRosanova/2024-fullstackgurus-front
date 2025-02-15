import React, { useState, useMemo } from 'react';
import { Box, Typography, Dialog, Card, CardContent, Button, Tooltip} from '@mui/material';
import { format, subDays } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { grey } from '@mui/material/colors';

interface DataForChart {
  date: string;
  timestamp: number;
  Calories: number;
  Minutes: number;
}

interface Last30DaysCalendarProps {
  dataForChart: DataForChart[]; 
}

const Last30DaysCalendar: React.FC<Last30DaysCalendarProps> = ({ dataForChart }) => {
  const [open, setOpen] = useState(false);

  // 1) Filter the full historical data to only the last 30 days
  const last30DaysData = useMemo(() => {
    const today = new Date().getTime();
    const cutoff = subDays(new Date(), 30).getTime(); 
    return dataForChart.filter(item => {
      return item.timestamp >= cutoff && item.timestamp <= today;
    });
  }, [dataForChart]);

  // 2) Compute how many days in the last 30 had NO exercise
  const { restDaysCount, exerciseSet } = useMemo(() => {
    const exerciseSet = new Set<string>();

    last30DaysData.forEach(item => {
      const [day, month] = item.date.split('/'); 
      const dayMonth = `${day}/${month}`;
      if (item.Minutes > 0) {
        exerciseSet.add(dayMonth);
      }
    });

    let restCount = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(new Date(), i);
      const dayStr = format(day, 'dd/MM');
      if (!exerciseSet.has(dayStr)) {
        restCount++;
      }
    }

    return { restDaysCount: restCount, exerciseSet };
  }, [last30DaysData]);

  const last30DaysArray = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      arr.push(subDays(new Date(), i));
    }
    return arr;
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          backgroundColor: 'black',
          borderColor: '#4b5563',
          borderWidth: 0.5,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          width: 'auto',
          px: 2,
          py: 1,
        }}
        onClick={handleOpen}
      >
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: '0.6rem', sm: '0.9rem', lg: '0.9rem' } }}
          marginBottom={0.5}
        >
          Rest Days:
        </Typography>

        <CalendarTodayIcon
          sx={{ fontSize: '3rem', color: '#fff' }}
        />

        <Typography
          variant="body1"
          color="gray"
          fontWeight={1000}
          sx={{ fontSize: { xs: '1.3rem', sm: '1.3rem', lg: '1.3rem' } }}
          marginTop={-4.3}
        >
          {restDaysCount}
        </Typography>

        <Typography
          variant="body2"
          color="#fff"
          marginTop={1}
          sx={{ fontSize: { xs: '0.5rem', sm: '0.5rem', lg: '0.5rem' } }}
        >
          (Click to see calendar)
        </Typography>
      </Card>

      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: grey[800], borderRadius:'8px' } }}>
        <Card sx={{width: 360, maxWidth: '100%', p: 2, outline: 'none', backgroundColor: grey[800], borderRadius:'8px'}}>
          <CardContent>
            <Typography variant="h6" mb={2} color="#fff" fontWeight="bold"> Last 30 Days </Typography>
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
              {last30DaysArray.map((dateObj, index) => {
                const dayStr = format(dateObj, 'dd/MM');
                const hasExercise = exerciseSet.has(dayStr);

                return (
                  <Tooltip title={hasExercise ? 'Exercise day' : 'Rest day'} key={index}>
                  <Box
                    sx={{
                      width: {xs: 30, sm: 36, lg:36},
                      height: {xs: 30, sm: 36, lg:36},
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      backgroundColor: hasExercise ? '#E43654' : 'gray',
                      color: '#fff',
                      cursor: 'default',
                    }}
                  >
                    {format(dateObj, 'dd')}
                  </Box>
                  </Tooltip>
                );
              })}
            </Box>
            <Box mt={2}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.8rem', color: '#fff' } }}>
                * Remember that resting is also important for recovery! Training every day is not the best practice!
              </Typography>
            </Box>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleClose} sx={{ color: '#fff' }}>
                Close
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
};

export default Last30DaysCalendar;