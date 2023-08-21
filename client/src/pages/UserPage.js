import { useEffect, useState } from 'react';
import { Container, Divider, Link, Button, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EmptyPage from './EmptyPage';
import BookInfo from '../components/BookInfo';

const config = require('../config.json');
const logged_in = JSON.parse(localStorage.getItem('logged_in'))

export default function UserPage() {
  const [library, setLibrary] = useState([])
  const [, setAuthor] = useState('')
  const [bookOfTheDay, setBookOfTheDay] = useState({});
  const [showBookOfDay, setShowBookOfDay] = useState(false);
  const [libraryBookId, setLibraryBook] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  const [recommendations, setRecommendations] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null)

  const user_id = localStorage.getItem('user_id')

  const handleLogout = () => {
    localStorage.setItem('logged_in', false)
    localStorage.setItem('user_id', '')
    window.open('/login', '_self')
  }

  const libraryCols = [
    { 
      field: 'book_title',
      headerName: 'Book',
      width: 500,
      renderCell: (params) => (
      <Link onClick={() => setLibraryBook(params.id)}>{params.value}</Link>
      )
    },
    { 
      field: 'date_added',
      headerName: 'Date Added',
      width: 500
    }
  ]

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/random_book`)
      .then(res => res.json())
      .then(resJson => setBookOfTheDay(resJson[0].id));

      fetch(`http://${config.server_host}:${config.server_port}/user_library/${user_id}`)
      .then(res => res.json())
      .then(resJson => setLibrary(resJson));

      fetch(`http://${config.server_host}:${config.server_port}/user_recommendations/${user_id}`)
      .then(res => res.json())
      .then(resJson => setRecommendations(resJson));

      fetch(`http://${config.server_host}:${config.server_port}/user_information/${user_id}`)
      .then(res => res.json())
      .then(resJson => setUserInfo(resJson))
  }, []);

  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }

  return logged_in ? (
    <Container>
      {showBookOfDay && <BookInfo bookId={bookOfTheDay} handleClose={() => setShowBookOfDay(!showBookOfDay)} />}
      {libraryBookId && <BookInfo bookId={libraryBookId} handleClose={() => setLibraryBook(null)} />}
      <h2>Your book of the moment is...
        <Link onClick={() => setShowBookOfDay(bookOfTheDay)}> here!</Link>
      </h2>

      <Divider />
      <h2>Your Library</h2>

      {!!library.length && 
        <DataGrid
            style={{backgroundColor: "beige"}}
            rows={library}
            columns={libraryCols}
            autoHeight
        />
      }
      {!library.length &&
        <p>There's nothing here...add some books to the your library!</p>
      }
      <br/>

      <h2> Your Recommendations
      </h2>
      <div style={flexFormat}>
      {selectedBookId && <BookInfo bookId={selectedBookId} handleClose={() => setSelectedBookId(null)} />}
      {recommendations.map((rec) =>
        <Box
          key={rec.book_id}
          p={2}
          m={3}
          style={{ background: 'beige', color: 'black', borderRadius: '16px', border: '2px solid #000' }}
        >
            <center>
                {
                    <Link onClick={() => setSelectedBookId(rec.book_id)}>
                        {
                            <img 
                            src={rec.image_url}
                            width="200"
                            height="300"
                            />
                        }
                    </Link>
                }
            </center>
        </Box>
      )}
      </div>

      {userInfo.length &&
      <Box
        p={2}
        m={3}
        style={{ background: 'beige', color: 'black', borderRadius: '16px', border: '2px solid #000' }}
        >
        <h2>Some stats about you, {userInfo[0].user_name}!</h2>
        <h3>Avg Rating: {userInfo[0].avg_rating}</h3>
        <h3># Ratings: {userInfo[0].num_ratings}</h3>
        <h3># Books in Library: {userInfo[0].num_library}</h3>
        <h3>User ID: {userInfo[0].id}</h3>
      </Box>
      }
      <Button onClick={handleLogout}>Logout</Button>

    </Container>
    
  ) : (<EmptyPage/>);
};