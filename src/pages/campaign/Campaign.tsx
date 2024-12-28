import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect } from 'react';
import Latest from './components/Latest';
import MainContent from './components/MainContent';

export default function Campaign() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
      <div>
        <CssBaseline enableColorScheme />
        <Container
          maxWidth="lg"
          component="main"
          sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
        >
          <MainContent />
          <Latest />
        </Container>
      </div>
  );
}
