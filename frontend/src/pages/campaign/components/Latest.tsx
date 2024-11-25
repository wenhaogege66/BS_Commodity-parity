import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';


export default function Latest() {

  return (
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
        <Pagination hidePrevButton hideNextButton count={10} boundaryCount={10} />
      </Box>
    </div>
  );
}
