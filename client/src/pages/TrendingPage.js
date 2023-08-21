import { useEffect, useState } from 'react';
import { Container, Divider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EmptyPage from './EmptyPage';

const config = require('../config.json');
const logged_in = JSON.parse(localStorage.getItem('logged_in'))

export default function TrendingPage() {
  const [data, setData] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [nameFilter, setNameFilter] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/author_LND_statistics?name=${nameFilter}`)
      .then(res => res.json())
      .then(resJson => {
        setAuthors(resJson);
      });
  }, [nameFilter]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top_reviewers`)
      .then(res => res.json())
      .then(resJson => {
        setData(resJson);
      });
      
  }, []);

  const reviewerCols = [
    { field: 'user_name',headerName: 'Name', width: 200 },
    { field: 'num_reviews', headerName: '# Reviews', width: 200 },
    { field: 'num_ratings', headerName: '# Ratings', width: 200 },
    { field: 'avg_rating', headerName: 'Avg Rating', width: 200 },
    { field: 'num_votes', headerName: '# Votes', width: 200 },
    { field: 'num_library', headerName: 'Books in Library', width: 200 },
  ]

  const authorCols = [
    { field: 'name',headerName: 'Name', width: 200 },
    { field: 'num_dislikes', headerName: '# Dislikes', width: 200 },
    { field: 'num_neutral', headerName: '# Neutrals', width: 200 },
    { field: 'num_likes', headerName: '# Likes', width: 200 },
  ]
  
  return logged_in ? (
    <div class="reviewerbackground">
      <Container>    
        <h2 style={{color:"white", fontWeight: 'bold', textAlign:"center"}}>Top Reviewers</h2>
        <DataGrid
          style={{backgroundColor: "beige"}}
          rows={data}
          columns={reviewerCols}
          autoHeight
        />
      </Container>

      <Container>    
        <h2 style={{color:"white", fontWeight: 'bold', textAlign:"center"}}>Author Statistics</h2>
        <TextField
          label='Author Filter'
            onChange={(e) => setNameFilter(e.target.value)}
            style={{ width: "100%" , backgroundColor: "white"}}
        />
        <DataGrid
          style={{backgroundColor: "beige"}}
          rows={authors}
          columns={authorCols}
          autoHeight
          pageSize={pageSize}
          onPageSizeChange={(p) => setPageSize(p)}
          rowsPerPageOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: pageSize, page: 0 },
            },
          }}
        />
      </Container>
      <Divider/>
      
    </div>
  ) : (<EmptyPage/>);
};