const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/user_library/:user_id', routes.userLibrary);
app.get('/user_recommendations/:user_id', routes.userRecommendationsRandom);
app.get('/user_information/:user_id', routes.userInformation);
app.get('/random_book', routes.randomBook);

app.get('/top_reviewers', routes.topReviewers);

app.get('/series_information/:series_id', routes.seriesInformation);
app.get('/series_books/:series_id', routes.seriesBooks);
app.get('/search_series', routes.searchSeries);

app.get('/book_information/:book_id', routes.bookInformation);
app.get('/book_reviews/:book_id', routes.bookReviews);
app.get('/search_books', routes.searchBooks);
app.get('/book_authors/:book_id', routes.bookAuthors);

app.get('/author_LND_statistics', routes.authorLNDStatistics);
app.get('/search_authors', routes.searchAuthors);

app.get('/get_user_id/:user_name', routes.getUserId);
app.get('/check_in_library/:user_id/:book_id', routes.checkInLibrary);
app.get('/get_rating/:user_id/:book_id', routes.getRating)

app.post('/add_to_library/:user_id/:book_id', routes.addToLibrary);
app.post('/remove_from_library/:user_id/:book_id', routes.removeFromLibrary);

app.post('/handle_login/:user_name/:password', routes.handleLogin);
app.post('/register_user/:user_name/:email/:password/:name', routes.registerUser);
app.post('/update_review/:user_id/:book_id/:rating', routes.updateReview)

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;