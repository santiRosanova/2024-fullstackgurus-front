import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { SelectChangeEvent } from '@mui/material/Select';
import { Card, CardContent, CardHeader, IconButton, MenuItem } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../api/UserAPI';
import { grey } from '@mui/material/colors';
import { getAuth } from 'firebase/auth';
import Box from '@mui/material/Box';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { ArrowBack as ArrowLeftIcon } from '@mui/icons-material';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertErrorWeight, setAlertErrorWeight] = useState(false);
  const [alertErrorHeight, setAlertErrorHeight] = useState(false);
  const [missingFields, setMissingFields] = useState(false);

  const [userProfile, setUserProfile] = useState({
    full_name: '', 
    gender: '',
    weight: '',
    height: '',
    email: '',
    birthday: '',
  });

  const navigate = useNavigate();
  const auth = getAuth();

  const textFieldStyles = {
    '& .MuiInputBase-input': {
      color: grey[100],
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: grey[500],
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: grey[100],
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: grey[100],
    },
    '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: grey[700],
    },
    '& .MuiOutlinedInput-root.Mui-disabled': {
      backgroundColor: 'transparent',
      opacity: 1,
    },
    '& .MuiInputLabel-root': {
      color: grey[100],
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: grey[100],
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: grey[700],
    },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');
        
        setLoading(true);
        const profileData = await getUserProfile();

        const user = auth.currentUser;

        if (!user) {
          throw new Error("No user authenticated");
        }

      const requiredFields = ['fullName', 'gender', 'weight', 'height', 'birthday'];
      const missingField = requiredFields.some(field => !profileData[field]);

      if (missingField) {
        setIsEditing(true);
        setMissingFields(true);
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
        console.log('formattedData:', formattedData);
        setUserProfile(formattedData);
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
  
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    const twoDecimalRegex = /^\d+(\.\d{1,2})?$/;
    let maxValue = 0;
    let minValue = 0;
    if (name === 'height') {
      maxValue = 240
      minValue = 120
    } else {
      maxValue = 300
      minValue = 25
    }

    if (value === "") {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        [name]: "",
      }));
    } else {
      if (!twoDecimalRegex.test(value)) {
        return;
      }
      const numericValue = parseFloat(value);
      if (numericValue >= 1 && numericValue <= maxValue)  {
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          [name]: value,
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
  
      let weight = userProfile.weight ? parseFloat(userProfile.weight) : null;
      let height = userProfile.height ? parseFloat(userProfile.height) : null;
      let hasError = false;

      if (weight !== null) {
        if (isNaN(weight) || weight > 300 || weight < 25) {
          setAlertErrorWeight(true);
          hasError = true;
        }
        else {
          setAlertErrorWeight(false)
        }
      }
      else {
        // No se si tirar error específico para cuando está vacío
        setAlertErrorWeight(true);
        hasError = true;
      }
  
      if (height !== null) {
        if (isNaN(height) || height > 240 || height < 120) {
          setAlertErrorHeight(true);
          hasError = true;
        }
        else {
          setAlertErrorHeight(false)
        }
      }
      else {
        setAlertErrorHeight(true);
        hasError = true;
      }
      
      if (hasError) {
        return;
      }

      const profileData = {
        ...userProfile,
        weight: weight,
        height: height,
      };
  
      await updateUserProfile(profileData);
      setIsEditing(false);
      console.log('Perfil actualizado correctamente', profileData);
      setAlertOpen(true);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/homepage');
  };
  

  const handleLogOut = () => {
    localStorage.removeItem("token")
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-black from-gray-900 to-gray-800 text-white">
      <Box component="header" sx={{ display: 'flex', flexDirection: 'row', gap: 14}}>
        <Box className="flex items-center" sx={{flex: 1, mt: 4, ml: 4}}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
            <img src={require('../../images/logo.png')} alt="Logo" width={200} height={150}/>
        </Box>
      </Box>
      <TopMiddleAlert alertText='Modified data successfully' open={alertOpen} onClose={() => setAlertOpen(false)} severity='success'/>
      <TopMiddleAlert alertText='Weight cannot be empty and must be a number between 25 and 300' open={alertErrorWeight} onClose={() => setAlertErrorWeight(false)} severity='error'/>
      <TopMiddleAlert alertText='Height cannot be empty and must be a number between 120 and 240' open={alertErrorHeight} onClose={() => setAlertErrorHeight(false)} severity='error'/>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <LoadingAnimation />
        </Box>
      ) : (
          <main className="p-4 space-y-6 flex flex-col items-center justify-center">
            <Card sx={{ backgroundColor: '#161616', color: '#fff', mt: 10, borderRadius: 2 }} className='border border-gray-600 w-full max-w-md'>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <CardHeader title="User Profile" sx={{color: 'white'}}/>
                <IconButton
                  aria-label="edit"
                  onClick={() => {setIsEditing((prevState) => !prevState); setAlertErrorWeight(false); setAlertErrorHeight(false)}}>
                  <EditIcon sx={{ color: 'white', fontSize: 30, mr: 2 }} />
                </IconButton>
              </Box>
              <CardContent>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  label="Email"
                  value={userProfile.email}
                  disabled
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={userProfile.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  select
                  label="Sex"
                  name="gender"
                  value={userProfile.gender}
                  onChange={handleChange}
                  disabled={!missingFields}
                  sx={textFieldStyles}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Birthday"
                  name="birthday"
                  type="date"
                  value={userProfile.birthday}
                  onChange={handleChange}
                  disabled={!missingFields}
                  sx={textFieldStyles}
                  slotProps={{ htmlInput: { min: '1920-01-01', max: '2020-12-31' }, inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="Weight"
                  name="weight"
                  type='number'
                  value={userProfile.weight}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  label="Height"
                  name="height"
                  type='number'
                  value={userProfile.height}
                  onChange={handleNumericChange}
                  disabled={!isEditing}
                  sx={textFieldStyles}
                />
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
