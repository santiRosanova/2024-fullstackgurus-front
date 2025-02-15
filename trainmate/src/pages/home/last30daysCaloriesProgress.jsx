import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

const Last30DaysProgress = ({ last30DaysData }) => {
  const renderChangeIcon = (change, color) => {
    if (change > 0) {
      return <ArrowUpwardIcon style={{ color: color, marginRight: '4px' }} />;
    } else if (change < 0) {
      return <ArrowDownwardIcon style={{ color: color, marginRight: '4px' }} />;
    } else {
      return (
        <HorizontalRuleIcon style={{ color: color, marginRight: '4px' }} />
      );
    }
  };

  const getPerformanceMessage = (last30DaysData) => {
    const caloriesChange = last30DaysData.Calories?.change ?? 0;
    const minutesChange = last30DaysData.Minutes?.change ?? 0;

    if (caloriesChange > 0 && minutesChange > 0) {
      return 'Great job! You have increased both your calorie burn and workout duration!';
    } else if (caloriesChange < 0 && minutesChange < 0) {
      return 'Your activity has decreased in the last period. Let\'s get back on track!';
    } else if (caloriesChange > 0 && minutesChange < 0) {
      return 'You are burning more calories in less time. Keep up the intensity!';
    } else if (caloriesChange < 0 && minutesChange > 0) {
      return 'You are spending more time but burning fewer calories. Consider adjusting your workouts for better efficiency.';
    } else {
      return 'Keep tracking your progress and stay consistent!';
    }
  };

  const performanceMessage = getPerformanceMessage(last30DaysData);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          mt: 3,
          justifyContent: 'center',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Typography variant="h6" sx={{ textAlign: 'left' }}>
            Last 30 days:
          </Typography>
          <Typography variant="b1" sx={{ textAlign: 'left', fontSize: '0.7rem' }}>
              (Last 15 days vs Previous 15 days Average)
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row', md: 'row' },
            gap: { xs: 2, sm: 5, md: 13 },
            mt: 0,
            ml: { xs: 2, sm: 5, md: 10 },
          }}
        >
          <Typography
            variant="body1"
            sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}
          >
            {renderChangeIcon(last30DaysData.Calories?.change, '#E43654')}
            Calories: {last30DaysData.Calories?.change?.toFixed(1) ?? 'N/A'} kcal
          </Typography>

          <Typography
            variant="body1"
            sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}
          >
            {renderChangeIcon(last30DaysData.Minutes?.change, '#44f814')}
            Minutes: {last30DaysData.Minutes?.change?.toFixed(1) ?? 'N/A'} min
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0 }}>
        <Typography
          variant="body1"
          sx={{ mt: 4, fontWeight: 'bold', color: '#555', fontSize: 25 }}
        >
          {performanceMessage}
        </Typography>
      </Box>
    </Box>
  );
};

export default Last30DaysProgress;