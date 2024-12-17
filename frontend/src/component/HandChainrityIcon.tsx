import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { ReactComponent as MySvg } from '../asset/PriceScout.svg';
import { Box } from '@mui/material';

export default function HandChainrityIcon() {
  return (
    <Box style={{ height: 21, width: 100, marginRight: 2 , display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <MySvg style={{ height: 40, width: 100 }} />
    </Box>
  );
}
