import React, { useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { grey } from '@mui/material/colors';
import { saveGoal } from '../../api/GoalsApi';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.extend(isSameOrAfter);

interface ChallengeFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSave?: (formData: { startDate: string; endDate: string; title: string; description: string }) => void; // Optional callback after saving
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({ isOpen, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alertSaveGoalErrorOpen, setAlertSaveGoalErrorOpen] = useState(false);
  const [alertSaveGoalErrorMessage, setAlertSaveGoalErrorMessage] = useState('');

  // Handler for TextField changes
  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!formData.startDate || !formData.endDate || !formData.title) {
        setAlertSaveGoalErrorMessage('Please fill in all required fields.');
        setAlertSaveGoalErrorOpen(true);
        return;
      }
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : '',
        endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : '',
      };
      const savedGoal = await saveGoal(formattedData);
      if (onSave) onSave(savedGoal); // Call onSave callback if provided
      onCancel(); // Close the form
      setFormData({ startDate: null as Dayjs | null, endDate: null as Dayjs | null, title: '', description: '' }); // Clear form data
    } catch (error) {
      console.error('Error saving goal:', error);
      setAlertSaveGoalErrorMessage('Failed to save goal. ' + error);
      setAlertSaveGoalErrorOpen(true); // Open the alert
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
      <>
      <TopMiddleAlert alertText={alertSaveGoalErrorMessage} open={alertSaveGoalErrorOpen} onClose={() => setAlertSaveGoalErrorOpen(false)} severity='error'/>
        <Dialog open={isOpen} onClose={onCancel} PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            padding: 2,
            maxWidth: '600px',
            minWidth: '300px',
          },
        }}>
          <DialogTitle sx={{ color: '#fff', textAlign: 'center', fontSize: '2rem' }}>Add New Goal</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Title"
              name="title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleTextFieldChange}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
              sx={{ 
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
                mb: 2 
              }}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleTextFieldChange}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff', backgroundColor: grey[800] } }}
              sx={{ 
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
                mb: 2 
              }}
            />
            <Box sx={{ mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  name='startDate'
                  value={formData.startDate}
                  onChange={(newValue: Dayjs | null) => setFormData((prevState) => ({...prevState, startDate: newValue,}))}
                  format="DD/MM/YYYY"
                  minDate={dayjs()}
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
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  name='endDate'
                  value={formData.endDate}
                  onChange={(newValue: Dayjs | null) => setFormData((prevState) => ({...prevState, endDate: newValue,}))}
                  format="DD/MM/YYYY"
                  minDate={formData.startDate || dayjs()}
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
            <Button onClick={() => { setFormData({ startDate: null as Dayjs | null, endDate: null as Dayjs | null, title: '', description: '' }); onCancel(); }} sx={{ color: '#fff' }}>Close</Button>
            <Button onClick={handleSave} sx={{ color: '#fff' }} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Goal'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    
  );
};

export default ChallengeForm;
