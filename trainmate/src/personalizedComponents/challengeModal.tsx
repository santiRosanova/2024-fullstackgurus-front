import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import WorkspacePremiumTwoToneIcon from '@mui/icons-material/WorkspacePremiumTwoTone';
import { physicalChallenges, workoutChallenges } from '../enums/challenges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Challenges {
  id: number;
  challenge: string;
  state: boolean;
}

interface ChallengeModalProps {
  pageName: string;
  listOfChallenges: Challenges[];
  open: boolean;
  handleClose: () => void;
}

export default function ChallengeModal({ pageName, listOfChallenges, open, handleClose }: ChallengeModalProps) {
  const getChallengeDetails = (challengeName: string) => {
    if (pageName === 'Physical Challenges') {
      return physicalChallenges.find(([name]) => name === challengeName);
    }
    else if (pageName === 'Workouts Challenges') {
      return workoutChallenges.find(([name]) => name === challengeName);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: grey[800],
          color: '#fff',
          padding: 2,
          maxWidth: '600px',
          minWidth: '300px',
          borderRadius:'8px'
        },
      }}
      className="border border-gray-600 rounded"
    >
      <DialogTitle sx={{ color: '#fff', textAlign: 'center', fontSize: '2rem' }}>
        {pageName}
      </DialogTitle>
      <DialogContent dividers>
        {Array.isArray(listOfChallenges) && listOfChallenges.length > 0 ? (
          listOfChallenges.map((challenge) => {
            const challengeDetails = getChallengeDetails(challenge.challenge);
            return (
              <Box
                key={challenge.id}
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: challenge.state ? grey[700] : grey[900],
                  borderRadius: 2,
                  border: `1px solid ${challenge.state ? '#AE8625' : grey[600]}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkspacePremiumTwoToneIcon
                    sx={{
                      color: challenge.state ? '#AE8625' : grey[500],
                      mr: 1,
                      fontSize: '3rem',
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: challenge.state ? grey[400] : '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    {challenge.challenge}
                  </Typography>
                </Box>
                {challengeDetails && (
                  <>
                    <Typography variant="body2" sx={{ color: grey[300], mb: 1 }}>
                      <strong>Goal:</strong> {challengeDetails[1]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: grey[400], mb: 1 }}>
                      <strong>Description:</strong> {challengeDetails[2]}
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Typography variant="body2" sx={{ color: '#AE8625', fontWeight: 'bold' }}>
                        <strong>Badge:</strong> {challengeDetails[3]}
                      </Typography>
                      {challenge.state ? <CheckCircleIcon 
                        sx={{
                          color: '#AE8625',
                          mr: 1,
                        }}
                      /> : null}
                    </Box>
                  </>
                )}
              </Box>
            );
          })
        ) : (
          <Typography sx={{ color: '#fff' }}>No challenges available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: '#fff' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}