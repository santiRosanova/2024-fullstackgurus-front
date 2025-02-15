import { Dialog, DialogContent, DialogTitle, MenuItem, Select } from "@mui/material";
import { grey } from "@mui/material/colors";

export const FilterTrainingDialog = ({ filterTrainingOpen, handleFilterTrainingClose, selectedTrainingInFilter, setSelectedTrainingInFilter, trainings, handleFilterClose }: 
    { filterTrainingOpen: any; handleFilterTrainingClose: any; selectedTrainingInFilter: any; setSelectedTrainingInFilter: any; trainings: any; handleFilterClose: any }) => {
    return (
        <Dialog open={filterTrainingOpen} onClose={() => handleFilterTrainingClose()}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
            width:'550px'
          },
        }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Filter By Training</DialogTitle>
        <DialogContent>
        <Select
            fullWidth
            value={selectedTrainingInFilter?.id || ""}
            onChange={(e) => { 
              const selectedTraining = trainings.find((training: { id: string }) => training.id === e.target.value) || null;
              setSelectedTrainingInFilter(selectedTraining);
              handleFilterTrainingClose(selectedTraining);
              handleFilterClose();
            }}
            displayEmpty
            sx={{ marginBottom: 1,
              color: '#fff', // Color del texto en Select
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff', // Color del borde
              },
              '& .MuiSvgIcon-root': {
                color: '#fff', // Color del ícono (flecha de selección)
              }
             }}
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Training
            </MenuItem>
            {trainings.map((training: { id: string; name: string }) => (
              <MenuItem key={training.id} value={training.id}>
                {training.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
      </Dialog>
    );
  };