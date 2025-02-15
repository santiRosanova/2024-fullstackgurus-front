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
      return <HorizontalRuleIcon style={{ color: color, marginRight: '4px' }} />;
    }
  };

  const getPerformanceMessage = (last30DaysData) => {
    const bodyFatChange = last30DaysData.BodyFat?.change ?? 0;
    const bodyMuscleChange = last30DaysData.BodyMuscle?.change ?? 0;
  
    if (bodyFatChange < 0 && bodyMuscleChange > 0) {
      return 'You are doing great, keep going like that!';
    } else if (bodyFatChange > 0 && bodyMuscleChange < 0) {
      return 'Oops, not the best month, keep pushing to revert it!';
    } else if (bodyFatChange < 0 && bodyMuscleChange < 0) {
      return 'Good job on reducing body fat, but try to maintain your muscle mass.';
    } else if (bodyFatChange > 0 && bodyMuscleChange > 0) {
      return 'You gained both muscle and fat. Consider adjusting your diet or workout routine.';
    } else if (bodyFatChange === 0 && bodyMuscleChange === 0) {
      return 'No changes detected. Stay consistent and keep tracking!';
    } else {
      return 'Keep tracking your progress and stay consistent!';
    }
  };

  const performanceMessage = getPerformanceMessage(last30DaysData);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 8, justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ textAlign: 'left' }}> Last 30 days: </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, gap: { xs: 2, sm: 5, md: 5, lg: 18 }, mt: 0, ml: { xs: 2, sm: 5, md: 5, lg: 10 } }}>

          <Typography variant="body1" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {renderChangeIcon(last30DaysData.Weight?.change, '#0088FE')}
            Weight: {last30DaysData.Weight?.change?.toFixed(1) ?? 'N/A'} kg
          </Typography>

          <Typography variant="body1" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {renderChangeIcon(last30DaysData.BodyMuscle?.change, '#44f814')}
            Body Muscle: {last30DaysData.BodyMuscle?.change?.toFixed(1) ?? 'N/A'} kg
          </Typography>

          <Typography variant="body1" sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {renderChangeIcon(last30DaysData.BodyFat?.change, '#E43654')}
            Body Fat: {last30DaysData.BodyFat?.change?.toFixed(1) ?? 'N/A'} kg
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0}}>
        <Typography variant="body1" sx={{ mt: 4, fontWeight: 'bold', color: '#555', fontSize: 25 }}>
          {performanceMessage}
        </Typography>
      </Box>
    </Box>
  );
};

export default Last30DaysProgress;