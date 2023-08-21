import { useEffect, useState } from 'react';
import { Box, Button, Modal, Rating } from '@mui/material';
import { Link } from '@mui/material';
import EmptyPage from '../pages/EmptyPage';
import processData from '../helpers/processData';

const config = require('../config.json');

export default function BookInfo({ bookId, handleClose }) {
  const [bookData, setBookData] = useState({});
  const [bookAuthors, setBookAuthors] = useState([]);
  const [authorString, setAuthorString] = useState('');
  const [inLibrary, setInLibrary] = useState(false);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const user_id = localStorage.getItem('user_id')
    if (bookId && user_id) {
      fetch(`http://${config.server_host}:${config.server_port}/check_in_library/${user_id}/${bookId}`)
      .then(res => res.json())
      .then(resJson => {
        setInLibrary(!!resJson.length)
    })
    }

    fetch(`http://${config.server_host}:${config.server_port}/book_information/${bookId}`)
      .then(res => res.json())
      .then(resJson => {
        setBookData(processData(resJson)[0])
    })

    fetch(`http://${config.server_host}:${config.server_port}/get_rating/${user_id}/${bookId}`)
      .then(res => res.json())
      .then(resJson => {
        setRating(!!resJson[0].rating ? resJson[0].rating : null)
    })

    fetch(`http://${config.server_host}:${config.server_port}/book_authors/${bookId}`)
      .then(res => res.json())
      .then(resJson => {
        setBookAuthors(resJson)
    })
      
  }, [bookId]);

  useEffect(() => {
    if (bookAuthors.length) {
      const auths = bookAuthors.map(a => {return(a.name)})
      setAuthorString(auths.join(', '))
    }
    
  }, [bookAuthors])

  const handleAction = async () => {
    const user_id = localStorage.getItem('user_id')
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    if (!inLibrary) {
    setInLibrary(!inLibrary)
    return await fetch(`http://${config.server_host}:${config.server_port}/add_to_library/${user_id}/${bookId}`, requestOptions)
        .then(response => {return response})
    }
    else {
      setInLibrary(!inLibrary)
      return await fetch(`http://${config.server_host}:${config.server_port}/remove_from_library/${user_id}/${bookId}`, requestOptions)
        .then(response => {return response})
    }
  }

  const addRating = async () => {
    const user_id = localStorage.getItem('user_id')
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    return await fetch(`http://${config.server_host}:${config.server_port}/update_review/${user_id}/${bookId}/${rating}`, requestOptions)
        .then(response => {return response})
  }
  
  const logged_in = JSON.parse(localStorage.getItem('logged_in'))

  return logged_in ? (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}
    >
      <Box
        p={3}
        style={{ 
          width: '1000px',
          background: 'beige',
          borderRadius: '16px',
          border: '2px solid #000',
          maxHeight:'95%', 
          overflow:'auto'
      }}
      >
        <h1>{bookData.title}</h1>

        <center>
          <img 
            src={bookData.image_url}
            alt={`${bookData.title} book cover`}
            width="200"
            height="300"
          />
        </center>

        <h3>Written By: {authorString}</h3>
        <p>Description: {bookData.description ?? "N/A"} </p>
        <p>Number of Pages: {bookData.num_pages} </p>
        <p>Number of Reviews: {bookData.num_reviews} </p>
        <p>Average Rating: {bookData.avg_rating} </p>
        <Link style={{color: 'blue'}}onClick={() => window.open(`/book_reviews/${bookId}`, '_blank').focus()}>Reviews</Link>
        
        {inLibrary && 
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
          />
        }
        {inLibrary && 
          <Button onClick={addRating}>Rate Book</Button>
        }
        
        <br/>
        <Button onClick={handleAction}>{!inLibrary ? 'Add to ' : 'Remove from '} library</Button>
        
        
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  ) : (<EmptyPage/>);
}