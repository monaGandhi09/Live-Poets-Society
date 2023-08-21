import { useEffect, useState } from 'react';
import { Container, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import EmptyPage from './EmptyPage';

import SeriesInfo from '../components/SeriesInfo'

const config = require('../config.json');
const logged_in = JSON.parse(localStorage.getItem('logged_in'))

export default function SeriesPage() {
  const [series, setSeries] = useState([]);
  const [seriesFilter, setSeriesFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [selectedSeriesId, setSelectedSeriesId] = useState(null)

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_series?title=${seriesFilter}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(resJson => setSeries(resJson));
  }, [seriesFilter]);

  const seriesCols = [
    {
      field: 'title',
      headerName: 'Series Title',
      renderCell: (params) => (
        <Link onClick={() => setSelectedSeriesId(params.id)}>{params.value}</Link>
    ),
      width: 400,
    },
  ];


  return logged_in ? (
    <div class="seriesbackground">
      <Container>
        {selectedSeriesId && <SeriesInfo seriesId={selectedSeriesId} handleClose={() => setSelectedSeriesId(null)} />}

        <h2 style={{fontWeight: 'bold'}}>Filters</h2>
          <TextField 
            label="Series Filter"
            onChange={(e) => {setSeriesFilter(e.target.value)}}
            style={{width:'100%', backgroundColor:"white"}}
          /> 
          <h2 style={{fontWeight: 'bold'}}>Results</h2>
          <DataGrid
            style={{backgroundColor:"lightcyan"}}
            rows={series}
            columns={seriesCols}
            pageSize={pageSize}
            onPageSizeChange={(p) => setPageSize(p)}
            rowsPerPageOptions={[25, 50, 100]}
            autoHeight
            initialState={{
              pagination: {
                paginationModel: { pageSize: pageSize, page: 0 },
              },
            }}
          />
      </Container>
    </div>) 
    : 
    (<EmptyPage/>);

}