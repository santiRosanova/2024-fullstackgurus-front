import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import { grey } from '@mui/material/colors';

interface AreYouSureAlertProps {
    areYouSureTitle: string;
    areYouSureText: string;
    open: boolean;
    handleCloseAgree: any;
    handleCloseDisagree: any;
    dataToDelete: any;
}

export default function AreYouSureAlert({areYouSureTitle, areYouSureText, open, handleCloseAgree, handleCloseDisagree, dataToDelete}: AreYouSureAlertProps) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCloseDisagree}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }} id="alert-dialog-title">{areYouSureTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{color: 'white'}}>
            {areYouSureText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisagree} sx={{color: 'white'}}>
            Disagree
          </Button>
          <Button onClick={() => handleCloseAgree(dataToDelete)} sx={{color: 'white'}} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
