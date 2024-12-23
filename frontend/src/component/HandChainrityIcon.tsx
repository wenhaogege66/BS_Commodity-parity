import { Box } from '@mui/material';
import { ReactComponent as MySvg } from '../asset/PriceScout.svg';

export default function HandChainrityIcon() {
  return (
    <Box style={{ height: 21, width: 100, marginRight: 2 , display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <MySvg style={{ height: 40, width: 100 }} />
    </Box>
  );
}
