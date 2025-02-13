import React, { useState, useEffect } from 'react';
import { Box, Typography, Drawer, Divider, IconButton, Collapse, Card, CardContent, CardHeader } from '@mui/material';
import { Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

import { grey } from '@mui/material/colors';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { completeGoal, getGoals, Goal } from '../../api/GoalsApi';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Tooltip as TooltipMui } from '@mui/material'; // Alias Tooltip if needed
import SmsFailedIcon from '@mui/icons-material/SmsFailed';
import PieChartIcon from '@mui/icons-material/PieChart';

dayjs.extend(isSameOrBefore);

interface GoalsProps {
    showDrawer: () => void;
    onClose: () => void;
    open: boolean;
    openForm: () => void;

}

const GoalsModal: React.FC<GoalsProps> = ({ showDrawer, onClose, open, openForm }) => {
    const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
    const [showCompleted, setShowCompleted] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showIncomplete, setShowIncomplete] = useState(false); // New state for incomplete goals
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]);
    const [loading, setLoading] = useState(false);
    const [showPieChart, setShowPieChart] = useState(false);


    const fetchGoals = async () => {
        setLoading(true);
        try {
            const goals = await getGoals();
            setSelectedGoals(goals);
        } catch (error) {
            console.error('Error fetching goals:', error);
            setSelectedGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = async (dates: [Dayjs | null, Dayjs | null]) => {
        setDateRange(dates);
        fetchGoals();
    };

    useEffect(() => {
        if (open) {
            handleDateChange(dateRange);
        }
    }, [open]);

    const handleDone = async (goalId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token not found');
            setLoading(true);
            await completeGoal(token, goalId);

            setSelectedGoals((prevGoals) =>
                prevGoals.map((goal) => (goal.id === goalId ? { ...goal, completed: true } : goal))
            );
        } catch (error) {
            console.error('Error completing goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = dayjs();



    // Filter goals based on date range
    const filteredGoals = selectedGoals.filter((goal) => {
        const endDate = dayjs(goal.end_date);
        const [start, end] = dateRange;
        return (
            (!start || endDate.isSameOrAfter(start, 'day')) &&
            (!end || endDate.isSameOrBefore(end, 'day'))
        );
    });

    // Filter incomplete goals
    const incompleteGoals = filteredGoals.filter(
        (goal) => !goal.completed && dayjs(goal.end_date).isBefore(today, 'day')
    );


    const pendingGoals = filteredGoals.filter(
        (goal) => !goal.completed && !incompleteGoals.includes(goal)
    );



    const calculatePieData = () => {
        const completed = filteredGoals.filter((goal) => goal.completed).length;
        const pending = filteredGoals.filter((goal) => !goal.completed && dayjs(goal.end_date).isSameOrAfter(today, 'day')).length;
        const incomplete = incompleteGoals.length;

        return [
            { name: 'Completed', value: completed, color: "#44f814" },
            { name: 'Incomplete', value: incomplete, color: "#E43654" },
            { name: 'Pending', value: pending, color: "#81d8d0" },
        ];
    };

    const pieData = calculatePieData();



    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: '100%', sm: 400, lg: 400 },
                    padding: 2,
                    backgroundColor: grey[900],
                    color: grey[50],
                    height: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        color: grey[50],
                    }}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    sx={{
                        marginTop: 4,
                        marginBottom: 2,
                        color: grey[50],
                        textAlign: 'center',
                    }}
                >
                    Goals
                </Typography>

                <IconButton
                    style={{ position: 'absolute', right: 16, top: 16, color: '#fff' }}
                    aria-label="add"
                    onClick={openForm}
                >
                    <p className='text-sm text-white'>Add Goal</p>
                    <AddIcon />

                </IconButton>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DatePicker
                            label="Start Date"
                            value={dateRange[0]}
                            onChange={(newValue) => handleDateChange([newValue, dateRange[1]])}
                            format="DD/MM/YYYY"
                            slotProps={{
                                textField: {
                                    variant: 'outlined',
                                    fullWidth: true,
                                    sx: {
                                        backgroundColor: grey[800],
                                        color: grey[50],
                                        borderRadius: '8px',
                                        label: { color: grey[400], fontWeight: 'bold' },
                                        input: { color: '#fff' },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                borderColor: grey[700],
                                            },
                                            "&:hover fieldset": {
                                                borderColor: grey[400],
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: grey[100],
                                            },
                                        },
                                    },
                                },
                                popper: {
                                    sx: {
                                        "& .MuiPaper-root": {
                                            backgroundColor: grey[800],
                                        },
                                        "& .MuiPickersCalendarHeader-root": {
                                            color: grey[50], // Month/Year color
                                        },
                                        "& .MuiDayCalendar-weekDayLabel": {
                                            color: grey[400], // Weekday label colors
                                        },
                                        "& .MuiPickersDay-root": {
                                            color: grey[50], // Day numbers color
                                        },
                                        // Increase specificity to override default styles
                                        "& .MuiPickersDay-root.Mui-selected": {
                                            backgroundColor: '#000000 !important',
                                            color: grey[50],
                                            fontWeight: 'bold',
                                        },
                                        "& .MuiPickersDay-root.Mui-selected:hover": {
                                            backgroundColor: '#000000 !important',
                                        },
                                        // Style for today's date
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
                        <DatePicker
                            label="End Date"
                            value={dateRange[1]}
                            onChange={(newValue) => handleDateChange([dateRange[0], newValue])}
                            format="DD/MM/YYYY"
                            minDate={dateRange[0] || dayjs()}
                            slotProps={{
                                textField: {
                                    variant: 'outlined',
                                    fullWidth: true,
                                    sx: {
                                        backgroundColor: grey[800],
                                        color: grey[50],
                                        borderRadius: '8px',
                                        label: { color: grey[400], fontWeight: 'bold' },
                                        input: { color: '#fff' },
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                borderColor: grey[700],
                                            },
                                            "&:hover fieldset": {
                                                borderColor: grey[400],
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: grey[100],
                                            },
                                        },
                                    },
                                },
                                popper: {
                                    sx: {
                                        "& .MuiPaper-root": {
                                            backgroundColor: grey[800],
                                        },
                                        "& .MuiPickersCalendarHeader-root": {
                                            color: grey[50], // Month/Year color
                                        },
                                        "& .MuiDayCalendar-weekDayLabel": {
                                            color: grey[400], // Weekday label colors
                                        },
                                        "& .MuiPickersDay-root": {
                                            color: grey[50], // Day numbers color
                                        },
                                        // Increase specificity to override default styles
                                        "& .MuiPickersDay-root.Mui-selected": {
                                            backgroundColor: '#000000 !important',
                                            color: grey[50],
                                            fontWeight: 'bold',
                                        },
                                        "& .MuiPickersDay-root.Mui-selected:hover": {
                                            backgroundColor: '#000000 !important',
                                        },
                                        // Style for today's date
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
                    </Box>
                </LocalizationProvider>

                <Divider sx={{ marginY: 2, backgroundColor: grey[700] }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, marginBottom: 2 }}>
                    <TooltipMui title="Show stats" arrow>
                        <IconButton onClick={() => setShowPieChart(!showPieChart)}>
                            <PieChartIcon
                                sx={{
                                    color: showPieChart ? '#81d8d0' : grey[50], // Change color when active
                                    fontSize: 30,
                                }}
                            />
                            <p className='text-sm text-white'>Show stats</p>
                        </IconButton>

                    </TooltipMui>

                    <TooltipMui title="Show incompletes" arrow>
                        <IconButton onClick={() => setShowIncomplete(!showIncomplete)}>
                            <SmsFailedIcon
                                sx={{
                                    color: showIncomplete ? '#81d8d0' : grey[50], // Change color when active
                                    fontSize: 30,
                                }}
                            />
                            <p className='text-sm text-white'>Show incomplete</p>
                        </IconButton>
                    </TooltipMui>

                </Box>

                {showPieChart ? (
                    // Pie Chart View
                    <Card sx={{ backgroundColor: '#161616', color: '#fff', p: 2, height: 420 }} className="border border-gray-600">
                        <CardHeader title="Goal Distribution" />
                        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative', mt: -6 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <PieChart width={400} height={280}>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }} itemStyle={{ color: '#fff' }} />
                                    <Legend verticalAlign="top" height={50} wrapperStyle={{ marginTop: 5 }} />
                                </PieChart>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    // Goals List View
                    <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        {/* Completed Goals Toggle */}
                        <Divider sx={{ marginY: 2, backgroundColor: grey[600] }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowCompleted(!showCompleted)}>
                                <Typography sx={{ color: grey[50], flex: 1 }}>Completed Goals</Typography>
                                {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>
                        </Divider>
                        <Divider sx={{ backgroundColor: grey[600], mb: 2 }} />
                        <Collapse in={showCompleted}>
                            {filteredGoals.filter((goal) => goal.completed).map((goal: Goal) => (
                                <Box
                                    key={goal.id}
                                    sx={{
                                        marginBottom: 2,
                                        backgroundColor: grey[800],
                                        padding: 2,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography sx={{ color: '#81d8d0', fontWeight: 'bold' }}>{goal.title}</Typography>
                                    <Typography sx={{ color: grey[400] }}>{goal.description}</Typography>
                                    <Typography sx={{ color: '#44f814' }}>{`Start: ${dayjs(goal.start_date).format('DD/MM/YYYY')} - End: ${dayjs(goal.end_date).format('DD/MM/YYYY')}`}</Typography>
                                </Box>
                            ))}
                        </Collapse>

                        {/* Pending Goals Toggle */}

                        <Divider sx={{ marginY: 2, backgroundColor: grey[600] }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowPending(!showPending)}>

                                <Typography sx={{ color: grey[50], flex: 1 }}>Pending Goals</Typography>
                                {showPending ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>
                        </Divider>
                        <Divider sx={{ backgroundColor: grey[600], mb: 2 }} />
                        <Collapse in={showPending}>
                            {pendingGoals.filter((goal) => !goal.completed).map((goal: Goal) => (
                                <Box
                                    key={goal.id}
                                    sx={{
                                        marginBottom: 2,
                                        backgroundColor: grey[800],
                                        padding: 2,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography sx={{ color: '#81d8d0', fontWeight: 'bold' }}>{goal.title}</Typography>
                                    <Typography sx={{ color: grey[400] }}>{goal.description}</Typography>
                                    <Typography sx={{ color: 'yellow' }}>{`Start: ${dayjs(goal.start_date).format('DD/MM/YYYY')} - End: ${dayjs(goal.end_date).format('DD/MM/YYYY')}`}</Typography>
                                    <LoadingButton
                                        isLoading={false}
                                        onClick={() => handleDone(goal.id)}
                                        label="Done"
                                        icon={<CheckIcon />}
                                        borderColor="border-green-600"
                                        borderWidth="border"
                                        bgColor="bg-transparent"
                                        color="text-white"
                                    />
                                </Box>
                            ))}
                        </Collapse>

                        {/* Incomplete Goals Section */}
                        {showIncomplete && (
                            <>
                                <Divider sx={{ marginY: 2, backgroundColor: grey[600], borderRadius: '8px' }} >
                                    <Typography sx={{ color: grey[50], textAlign: 'center', mb: 1, mt: 1 }}>Incomplete Goals</Typography>
                                    {incompleteGoals.map((goal: Goal) => (
                                        <Box
                                            key={goal.id}
                                            sx={{
                                                marginBottom: 2,
                                                backgroundColor: grey[800],
                                                padding: 2,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Typography sx={{ color: '#81d8d0', fontWeight: 'bold' }}>{goal.title}</Typography>
                                            <Typography sx={{ color: grey[400] }}>{goal.description}</Typography>
                                            <Typography sx={{ color: '#E43654' }}>{`Start: ${dayjs(goal.start_date).format('DD/MM/YYYY')} - End: ${dayjs(goal.end_date).format('DD/MM/YYYY')}`}</Typography>
                                        </Box>
                                    ))}
                                </Divider>
                            </>
                        )}
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default GoalsModal;
