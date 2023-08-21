import { useEffect, useState } from 'react';
import { Container, TextField, Link } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import BookInfo from '../components/BookInfo';
import EmptyPage from './EmptyPage';
import processData from '../helpers/processData'

const config = require('../config.json');

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [titleFilter, setTitleFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)

  const logged_in = JSON.parse(localStorage.getItem('logged_in'))

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_books?title=${titleFilter}`)
      .then(res => res.json())
      .then(resJson => setBooks(processData(resJson)));
  }, [titleFilter]);

  const bookCols = [
    {
      field: 'title',
      headerName: 'Book Title',
      renderCell: (params) => (
        <Link onClick={() => setSelectedBookId(params.id)}>{params.value}</Link>
    ),
      width: 400,
    },
    {
      field: 'format',
      headerName: 'Format',
      width: 100,
    },
    {
      field: 'publisher',
      headerName: 'Publisher',
      width: 200,
    },
    {
      field: 'publish_date',
      headerName: 'Date Published',
      width: 200,
    }
  ];

  return logged_in ? (
    <div class="booksbackground">
      <Container>
        {selectedBookId && <BookInfo bookId={selectedBookId} handleClose={() => setSelectedBookId(null)} />}
        <h2 style={{fontWeight: 'bold', color:"white"}}>Filters</h2>
          <TextField 
            backgroundColor="white"
            label="Title Filter"
            onChange={(e) => {setTitleFilter(e.target.value)}}
            style={{width:'100%', backgroundColor:"white"}}
          /> 
          
          <h2 style={{fontWeight: 'bold', color:"white"}}>Results</h2>
          <DataGrid
            style={{backgroundColor: "lightgray"}}
            rows={books}
            columns={bookCols}
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
    (<EmptyPage />);
}