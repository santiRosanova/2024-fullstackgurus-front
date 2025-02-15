import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Card, CardContent, CardHeader, IconButton, MenuItem, Select, TextField, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../api/UserAPI';
import { grey } from '@mui/material/colors';
import { getAuth } from 'firebase/auth';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { ArrowBack as ArrowLeftIcon } from '@mui/icons-material';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


// --- Style objects ---
const baseTextFieldStyles = {
  // Any base styles you want in all states
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    // fallback border color
    borderColor: grey[700],
  },
  "& .MuiInputLabel-root": {
    color: grey[700],
  },
};

// Editing vs disabled text fields
const editingTextFieldStyles = {
  backgroundColor: "#161616",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: grey[700] },
    "&:hover fieldset": { borderColor: grey[500] },
    "&.Mui-focused fieldset": { borderColor: grey[100] },
  },
  "& .MuiInputBase-input": {
    color: "#fff",
  },
  "& .MuiInputLabel-root": {
    color: grey[100],
  },
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: grey[100],
  },
  
};

const disabledTextFieldStyles = {
  backgroundColor: "#161616",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: grey[800],
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: grey[700],
    WebkitTextFillColor: grey[700],
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: `${grey[700]} !important`,
  },
  "& .MuiInputLabel-root": {
    color: `${grey[700]} !important`,
  },
};

// Editing vs disabled select
const editingSelectStyles = {
  color: "#fff",
  backgroundColor: "#161616",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: grey[100],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: grey[500],
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: grey[100],
  },
  "& .MuiSelect-icon": {
    color: `${grey[500]} !important`,
  },
};

const disabledSelectStyles = {
  // Force the background and text color
  backgroundColor: "#161616 !important",
  color: `${grey[400]} !important`,
  WebkitTextFillColor: `${grey[400]} !important`,
  opacity: "1 !important",

  // The arrow icon
  "& .MuiSelect-icon": {
    color: `${grey[900]} !important`,
  },

  // The outline for the disabled state
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: `${grey[700]} !important`,
  },

  // If MUI also applies .Mui-disabled on the root
  "&.Mui-disabled": {
    backgroundColor: "#161616 !important",
    color: `${grey[400]} !important`,
    WebkitTextFillColor: `${grey[400]} !important`,
    opacity: "1 !important",

    // Double-check the outline again inside .Mui-disabled
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: `${grey[700]} !important`,
    },
  },

  // The text inside the Select when disabled
  "& .MuiSelect-select.Mui-disabled": {
    color: `${grey[700]} !important`,
    WebkitTextFillColor: `${grey[700]} !important`,
    opacity: "1 !important",
  },
};

// For the DatePicker text field
const editingDatePickerStyles = {
  backgroundColor: "#161616",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: grey[100] },
    "&:hover fieldset": { borderColor: grey[500] },
    "&.Mui-focused fieldset": { borderColor: grey[100] },
  },
  "& .MuiInputBase-input": {
    color: "#fff",
  },
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: grey[100],
  },
  "& .MuiInputLabel-root": {
    color: grey[100],
  },
};

const disabledDatePickerStyles = {
  backgroundColor: "#161616",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: grey[800],
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: grey[700],
    WebkitTextFillColor: grey[700],
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: `${grey[700]} !important`,
  },
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertErrorWeight, setAlertErrorWeight] = useState(false);
  const [alertErrorHeight, setAlertErrorHeight] = useState(false);
  const [alertExerciseFillFieldsOpen, setAlertExerciseFillFieldsOpen] = useState(false);
  const [missingFields, setMissingFields] = useState(false);
  const [missingFieldsAlert, setMissingFieldsAlert] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [userProfile, setUserProfile] = useState({
    full_name: '',
    gender: '',
    weight: '',
    height: '',
    email: '',
    birthday: '', // stored as YYYY-MM-DD
  });

  const navigate = useNavigate();
  const auth = getAuth();

  // If required fields are missing or if user explicitly clicked "Edit," fields become editable.
  const editable = isEditing && missingFields;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        setLoading(true);
        const profileData = await getUserProfile();

        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user authenticated');
        }

        // Check if required fields are missing
        const requiredFields = ['fullName', 'gender', 'weight', 'height', 'birthday'];
        const missingField = requiredFields.some(field => !profileData[field]);
        if (missingField) {
          setIsEditing(true);
          setMissingFields(true);
          setMissingFieldsAlert(true);
          setIsFirstTime(true);
        }

        const email = user.email;
        const formattedData = {
          full_name: profileData.fullName,
          gender: profileData.gender,
          weight: profileData.weight,
          height: profileData.height,
          email: email || profileData.email,
          birthday: profileData.birthday,
        };
        setUserProfile(formattedData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleNumericChange = (e: any) => {
    const { name, value } = e.target;
    const stringValue = value as string;
    const twoDecimalRegex = /^\d+(\.\d{1,2})?$/;
    let maxValue = 0;
    let minValue = 0;
    if (name === 'height') {
      maxValue = 240;
      minValue = 120;
    } else {
      maxValue = 300;
      minValue = 25;
    }

    if (stringValue === "") {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        [name]: "",
      }));
    } else {
      if (!twoDecimalRegex.test(stringValue)) {
        return;
      }
      const numericValue = parseFloat(stringValue);
      if (numericValue >= 1 && numericValue <= maxValue) {
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          [name]: stringValue,
        }));
      } else if (numericValue < 1) {
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          [name]: minValue.toString(),
        }));
      } else if (numericValue > maxValue) {
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          [name]: maxValue.toString(),
        }));
      }
    }
  };

  const handleSave = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      // Check for empty fields
      const { full_name, gender, weight, height, birthday } = userProfile;
      if (!full_name.trim() || !gender.trim() || !weight || !height || !birthday) {
        setAlertExerciseFillFieldsOpen(true);
        return;
      }

      // Validate numeric ranges
      let weightNumber = parseFloat(weight);
      let heightNumber = parseFloat(height);
      let hasError = false;

      // Validate Weight
      if (isNaN(weightNumber) || weightNumber > 300 || weightNumber < 25) {
        setAlertErrorWeight(true);
        hasError = true;
      } else {
        setAlertErrorWeight(false);
      }

      // Validate Height
      if (isNaN(heightNumber) || heightNumber > 240 || heightNumber < 120) {
        setAlertErrorHeight(true);
        hasError = true;
      } else {
        setAlertErrorHeight(false);
      }

      if (hasError) {
        return;
      }

      const profileData = {
        ...userProfile,
        weight: weightNumber,
        height: heightNumber,
      };

      updateUserProfile(profileData)
        .then(() => {
          setMissingFields(false);
          setMissingFieldsAlert(false);

          if (isFirstTime) {
            setIsEditing(false);
            window.location.href = "/homepage";
          } else {
            console.log("Profile updated successfully");
            setIsEditing(false);
            setAlertOpen(true);
          }
        });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleBackToHome = () => {
    navigate("/homepage");
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 text-white">
      <Box component="header" sx={{ display: 'flex', flexDirection: 'row', gap: 14 }}>
        <Box className="flex items-center" sx={{ flex: 1, mt: 4, ml: 4 }}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
          <img src={require('../../images/logo.png')} alt="Logo" width={200} height={150} />
        </Box>
      </Box>
      <TopMiddleAlert
        alertText="Modified data successfully"
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        severity="success"
      />
      <TopMiddleAlert
        alertText="Weight cannot be empty and must be a number between 25 and 300"
        open={alertErrorWeight}
        onClose={() => setAlertErrorWeight(false)}
        severity="error"
      />
      <TopMiddleAlert
        alertText="Height cannot be empty and must be a number between 120 and 240"
        open={alertErrorHeight}
        onClose={() => setAlertErrorHeight(false)}
        severity="error"
      />
      <TopMiddleAlert
        alertText="Please complete your profile before using the app"
        open={missingFieldsAlert}
        onClose={() => setMissingFieldsAlert(false)}
        severity="warning"
      />
      <TopMiddleAlert
        alertText="Please fill all fields"
        open={alertExerciseFillFieldsOpen}
        onClose={() => setAlertExerciseFillFieldsOpen(false)}
        severity="warning"
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <LoadingAnimation />
        </Box>
      ) : (
        <main className="p-4 space-y-6 flex flex-col items-center justify-center">
          <Card
            sx={{ backgroundColor: "#161616", color: "#fff", mt: 10, borderRadius: 2 }}
            className="border border-gray-600 w-full max-w-md"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <CardHeader title="User Profile" sx={{ color: 'white' }} />
              {!missingFields && (
                <IconButton
                  aria-label="edit"
                  onClick={() => {
                    setIsEditing((prevState) => !prevState);
                    setAlertErrorWeight(false);
                    setAlertErrorHeight(false);
                  }}
                >
                  <EditIcon sx={{ color: "white", fontSize: 30, mr: 2 }} />
                </IconButton>
              )}
            </Box>
            <CardContent>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email (always disabled) */}
                <TextField
                  label="Email"
                  value={userProfile.email}
                  disabled
                  sx={{
                    ...baseTextFieldStyles,
                    ...disabledTextFieldStyles, // always disabled
                  }}
                />

                {/* Full Name */}
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={userProfile.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{
                    ...baseTextFieldStyles,
                    ...(isEditing ? editingTextFieldStyles : disabledTextFieldStyles),
                  }}
                />

                {/* Gender using Select */}
                <Select
                  name="gender"
                  value={userProfile.gender ? userProfile.gender : ""}
                  onChange={handleChange}
                  displayEmpty
                  disabled={!editable}
                  sx={{
                    ...(editable ? editingSelectStyles : disabledSelectStyles),
                    width: "100%",
                    height: "56px",
                    borderRadius: "4px",
                    marginTop: "0px",
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: "#161616",
                        color: "white",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: "gray" }}>Select Gender</span>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>

                {/* Birthday using DatePicker */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Birthday"
                    value={userProfile.birthday ? dayjs(userProfile.birthday) : null}
                    onChange={(newValue: Dayjs | null) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        birthday: newValue ? newValue.format('YYYY-MM-DD') : '',
                      }))
                    }
                    format="DD/MM/YYYY"
                    maxDate={dayjs()}
                    disabled={!editable}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          ...baseTextFieldStyles,
                          ...(editable ? editingDatePickerStyles : disabledDatePickerStyles),
                          // Make sure the height is consistent
                          height: "56px",
                          borderRadius: "4px",
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": { backgroundColor: grey[800] },
                          "& .MuiPickersCalendarHeader-root": { color: grey[50] },
                          "& .MuiDayCalendar-weekDayLabel": { color: grey[400] },
                          "& .MuiPickersDay-root": { color: grey[50] },
                          "& .MuiPickersDay-root.Mui-selected": {
                            backgroundColor: "#000000 !important",
                            color: grey[50],
                            fontWeight: "bold",
                          },
                          "& .MuiPickersDay-root.Mui-selected:hover": {
                            backgroundColor: "#000000 !important",
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
                          color: grey[600],
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                {/* Weight */}
                <TextField
                  fullWidth
                  label="Weight"
                  name="weight"
                  type="number"
                  value={userProfile.weight}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  placeholder="Weight (kg)"
                  sx={{
                    ...baseTextFieldStyles,
                    ...(isEditing ? editingTextFieldStyles : disabledTextFieldStyles),
                  }}
                />

                {/* Height */}
                <TextField
                  fullWidth
                  label="Height"
                  name="height"
                  type="number"
                  value={userProfile.height}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  placeholder="Height (cm)"
                  sx={{
                    ...baseTextFieldStyles,
                    ...(isEditing ? editingTextFieldStyles : disabledTextFieldStyles),
                  }}
                />

                {/* Save Button */}
                {isEditing && (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mt: 2, backgroundColor: '#008000' }}
                  >
                    Save changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          <Button
            variant="outlined"
            onClick={handleLogOut}
            sx={{ mt: 2, color: 'red', borderColor: 'red' }}
          >
            Log out
          </Button>
        </main>
      )}
    </div>
  );
}
