import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import EmptyPage from './EmptyPage';
import processData from '../helpers/processData'

const config = require('../config.json');
const logged_in = JSON.parse(localStorage.getItem('logged_in'))

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const { book_id } = useParams()

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/book_reviews/${book_id}`)
      .then(res => res.json())
      .then(resJson => setReviews(processData(resJson)));
  }, []);

  return logged_in ? (
    <Container>
      {reviews.map((rev) =>
        <Box
          key={rev.album_id}
          p={3}
          m={2}
          style={{ background: 'beige', color: 'black', borderRadius: '16px', border: '2px solid #000' }}
        >
            {
                <>
                    <h2>Rating: {rev.rating}</h2>
                    <p>{rev.text}</p>
                </>
            }
        </Box>
      )}
    </Container>
  ) : (<EmptyPage/>);
}