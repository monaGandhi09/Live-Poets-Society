import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EmptyPage from './EmptyPage';
import processData from '../helpers/processData';

const config = require('../config.json');
const logged_in = JSON.parse(localStorage.getItem('logged_in'))

export default function UserPage() {
  const [data, setData] = useState([]);
  const [nameFilter, setNameFilter] = useState('')
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_authors?author_name=${nameFilter}`)
      .then(res => res.json())
      .then(resJson => {
        setData(processData(resJson));
      });
  }, [nameFilter]);

  const columns = [
    { field: 'author_name', headerName: 'Author Name', width: 200 },
    { field: 'num_books', headerName: 'Number of Works', width: 200 },
    { field: 'avg_rating', headerName: 'Average Rating', width: 200 },
    { field: 'min_rating', headerName: 'Minimum Rating', width: 200 },
    { field: 'max_rating', headerName: 'Maximum Rating', width: 200 },
    { field: 'num_ratings', headerName: 'Number of Ratings', width: 200 },
  ]

  return logged_in ? (
    <div class="authorsbackground">
      <Container>
        <h2 style={{fontWeight: 'bold'}}>Filters</h2>
        <TextField
          label='Author Filter'
            onChange={(e) => setNameFilter(e.target.value)}
            style={{ width: "100%" , backgroundColor: "white"}}
        />
      
        <h2 style={{fontWeight: 'bold'}}>Results</h2>
        <DataGrid
          style={{backgroundColor: "beige"}}
          rows={data}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
        />
      </Container>
    </div>
  ) : (<EmptyPage/>);
};