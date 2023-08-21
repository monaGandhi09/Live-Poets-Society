import { useEffect, useState } from 'react';
import { Box, Button,  Modal } from '@mui/material';

const config = require('../config.json');

export default function SeriesInfo({ seriesId, handleClose }) {
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/series_books/${seriesId}`)
      .then(res => res.json())
      .then(resJson => {
        setSeriesData(resJson)
        })
  }, [seriesId]);


  console.log(seriesData)
  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>Works in Series</h1>
        { !!seriesData && 
            seriesData.map((s) => {
                return (
                  <p>{s.title}</p>
                )
              })
        }
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}