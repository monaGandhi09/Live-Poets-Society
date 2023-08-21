const mysql = require('mysql');
const config = require('./config.json');
const crypto = require('crypto')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const randomBook = async function(req, res) {
  connection.query(
    `
    SELECT id 
    FROM Book 
    ORDER BY RAND() 
    LIMIT 1
    `
  ,(err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  }
);
}

const userLibrary = async function(req, res) {
  const user_id = req.params.user_id;

  connection.query(
    `
    WITH in_library_trunc AS (
      SELECT book_id,
             date_added
      FROM In_Library
      WHERE user_id = '${user_id}'
    )
    SELECT book_id id, 
           B.title book_title,
           ILT.date_added date_added
    FROM Book B
         JOIN in_library_trunc ILT ON B.id = ILT.book_id
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const userRandom = async function(user_id){
  return new Promise(function(resolve) {
    connection.query(
      `
      WITH review_trunc AS (
        SELECT book_id,
               COUNT(*) num_reviews
        FROM Review
          WHERE book_id NOT IN 
            (SELECT book_id 
             FROM In_Library 
             WHERE user_id = '${user_id}')
        GROUP BY book_id
        ORDER BY num_reviews DESC
        LIMIT 16
      )
      SELECT B.id book_id, 
             B.title book_title,
             B.image_url image_url
      FROM Book B
           JOIN review_trunc RT ON B.id = RT.book_id
      `, (err, data) => {
        if (err) {
          console.log(err);
          resolve(json([]));
        } else {
          resolve(data);
        }
      }); 
    }
  )
}

const userRecommendations = async function(user_id) {
  return new Promise(function(resolve) {
    connection.query(
      `
      WITH author_user AS (
        SELECT author_id,
               user_id,
               AVG(rating) avg_rating
        FROM ABRU_View
        GROUP BY author_id, user_id
    ), top_authors AS (
        SELECT author_id
        FROM author_user
        WHERE user_id = '${user_id}' AND
              avg_rating >= 4.0
    ), similar_users AS (
        SELECT DISTINCT user_id
        FROM author_user
        WHERE user_id != '${user_id}' AND
              author_id IN (SELECT author_id FROM top_authors) AND
              avg_rating = 5.0
    ), similar_users_books AS (
        SELECT DISTINCT R.book_id
        FROM Review R
             JOIN similar_users SU ON R.user_id = SU.user_id
        WHERE rating >= 4.0 AND
              R.book_id NOT IN (
                SELECT book_id
                FROM In_Library
                WHERE user_id = '${user_id}'
              )
        LIMIT 16
    )
    SELECT B.id book_id,
           B.title book_title,
           B.image_url image_url
    FROM Book B
         JOIN similar_users_books ON B.id = similar_users_books.book_id
      `, (err, data) => {
        if (err) {
          console.log(err);
          resolve(json([]));
        } else {
          resolve(data);
        }
      }); 
    }
  );
}

const userRecommendationsRandom = async function(req, res) {
  const user_id = req.params.user_id;
  const data = await userRecommendations(user_id);
  const data1 = await userRandom(user_id);
  if (data.length < 16) {
    let seen_ids = new Set();
    for (let i = 0; i < data.length; i++) {
      seen_ids.add(data[i].book_id);
    }
    i = 0;
    while (data.length < 16) {
      if (!seen_ids.has(data1[i].book_id)) {
        data.push(data1[i]);
      }
      i++;
    }
    res.json(data);
  } else {
  res.json(data);
  }
}

const getUserInformation = function(user_id) {
  return new Promise(function(resolve) {
    connection.query(
      `
      WITH user_trunc AS (
        SELECT id user_id,
               name user_name
        FROM User
        WHERE id = '${user_id}'
      ), in_library_trunc AS (
        SELECT user_id,
               COUNT(*) num_library
        FROM In_Library
        WHERE user_id = '${user_id}'
        GROUP BY user_id
      ), review_trunc AS (
        SELECT user_id,
               COUNT(rating) num_ratings,
               ROUND(AVG(rating), 1) avg_rating,
               COUNT(id) num_reviews,
               SUM(num_votes) num_votes,
               SUM(num_comments) num_comments
        FROM Review
        WHERE user_id = '${user_id}'
        GROUP BY user_id
      )
      SELECT UT.user_id id,
             UT.user_name,
             ILT.num_library,
             RT.num_ratings,
             RT.avg_rating,
             RT.num_reviews,
             RT.num_votes,
             RT.num_comments      
      FROM user_trunc UT
           JOIN in_library_trunc ILT ON UT.user_id = ILT.user_id
           JOIN review_trunc RT ON ILT.user_id = RT.user_id
      `, (err, data) => {
        if (err) {
          console.log(err);
          resolve(json([]));
        } else {
          resolve(data);
        }
      }); 
    }
  );
}

const userInformation = async function(req, res) {
  const user_id = req.params.user_id;
  const data = await getUserInformation(user_id);
  res.json(data);
}

const getTopReviewerIds = function() {
  return new Promise(function(resolve) {
    connection.query(
      `
      SELECT user_id
      FROM Review
      GROUP BY user_id
      ORDER BY COUNT(id) DESC
      LIMIT 15
      `, (err, data) => {
        if (err) {
          console.log(err);
          resolve(json([]));
        } else {
          resolve(data);
        }
      }); 
    }
  );
}

const topReviewers = async function(req, res) {
  let user_ids = await getTopReviewerIds();
  const arr = [];
  for (let i = 0; i < user_ids.length; i++){
    const user_id = user_ids[i].user_id;
    const user_information = await getUserInformation(user_id);
    arr.push(user_information[0]);
  }
  res.json(arr);
}

const seriesInformation = async function(req, res) {
  const series_id = req.params.series_id;

  connection.query(
    `
    SELECT S.title title,
           S.description description,
           S.numbered numbered,
           COUNT(INS.book_id) num_books
    FROM Series S
         JOIN In_Series INS ON S.id = INS.series_id
    WHERE S.id = ${series_id}
    GROUP BY S.id
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const seriesBooks = async function(req, res) {
  const series_id = req.params.series_id;

  connection.query(
    `
    SELECT B.id id,
           B.title title
    FROM In_Series INS
         JOIN Book B ON INS.book_id = B.id
    WHERE INS.series_id = ${series_id}
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const searchSeries = async function(req, res) {
  const title = req.query.title ?? '%';

  connection.query(
    `
    SELECT id,
           title 
    FROM Series
    WHERE title LIKE '%${title}%'
    ORDER BY title
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const bookInformation = async function(req, res) {
  const book_id = req.params.book_id;
  
  connection.query(
    `
    WITH book_trunc AS (
      SELECT id,
             title,
             description,
             format,
             publisher,
             publish_date,
             num_pages,
             image_url
      FROM Book
      WHERE id = ${book_id}
    )
    SELECT B.title title,
           B.description description,
           B.format format,
           B.publisher publisher,
           B.publish_date publish_date,
           B.num_pages num_pages,
           COUNT(R.id) num_reviews,
           ROUND(AVG(R.rating), 1) avg_rating,
           B.image_url image_url
    FROM book_trunc B
         JOIN Review R ON B.id = R.book_id
    GROUP BY B.id
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const bookReviews = async function(req, res) {
  const book_id = req.params.book_id ?? '';

  connection.query(
    `
    SELECT text,
           rating
    FROM Review
    WHERE book_id = ${book_id}
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const bookAuthors = async function(req, res) {
  const book_id = req.params.book_id;

  connection.query(
    `
    SELECT id,
           name
    FROM Author
    WHERE id IN (
      SELECT author_id
      FROM Written_By WB
      WHERE book_id = '${book_id}'
    )
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const searchBooks = async function(req, res) {
  const title = req.query.title ?? '%';

  connection.query(
    `
    SELECT id,
           title,
           description,
           format, 
           publisher, 
           publish_date
    FROM Book
    WHERE title LIKE '%${title}%'
    LIMIT 2000
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const authorLNDStatistics = async function(req, res) {
  const name = req.query.name ?? '%'
  connection.query(
    `
    WITH author_user AS (
      SELECT author_id,
             author_name,
             user_id,
             AVG(rating) avg_rating
      FROM ABRU_View
      WHERE author_name LIKE '%${name}%'
      GROUP BY author_id, user_id
    ), dislikes AS (
      SELECT author_id,
             author_name,
             COUNT(user_id) num_dislikes
      FROM author_user
      WHERE avg_rating < 3.0
      GROUP BY author_id, author_name
    ), neutral AS (
      SELECT author_id,
             author_name,
             COUNT(user_id) num_neutral
      FROM author_user
      WHERE avg_rating = 3.0
      GROUP BY author_id, author_name
    ), likes AS (
      SELECT author_id,
             author_name,
             COUNT(user_id) num_likes
      FROM author_user
      WHERE avg_rating > 3.0
      GROUP BY author_id, author_name
    ), DN AS (
        SELECT D.author_id,
               D.author_name,
               num_dislikes,
               num_neutral
        FROM dislikes D
             LEFT JOIN neutral N ON D.author_id = N.author_id
        UNION
        SELECT N.author_id,
               N.author_name,
               num_dislikes,
               num_neutral
        FROM dislikes D
             RIGHT JOIN neutral N ON D.author_id = N.author_id
    ), DNL AS (
        SELECT DN.author_id,
               DN.author_name,
               num_dislikes,
               num_neutral,
               num_likes
        FROM DN
             LEFT JOIN likes ON DN.author_id = likes.author_id
        UNION
        SELECT likes.author_id,
               likes.author_name,
               num_dislikes,
               num_neutral,
               num_likes
        FROM DN
             RIGHT JOIN likes ON DN.author_id = likes.author_id
    )
    SELECT author_id id,
           author_name name,
           IFNULL(num_dislikes, 0) num_dislikes,
           IFNULL(num_neutral, 0) num_neutral,
           IFNULL(num_likes, 0) num_likes
    FROM DNL
    `, (err, data) => {
      if (err) {
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const searchAuthors = async function(req, res) {
  const name = req.query.author_name ?? '';

  connection.query(
    `
    SELECT author_name,
           author_id id,
           COUNT(DISTINCT book_id) num_books,
           COUNT(review_id) num_reviews,
           COUNT(rating) num_ratings,
           ROUND(AVG(rating), 1) avg_rating,
           MIN(rating) min_rating,
           MAX(rating) max_rating
    FROM ABRU_View
    WHERE author_name LIKE '%${name}%'
    GROUP BY author_id
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const checkUsernameExists = function(username) {
  return new Promise(function(resolve) {
    connection.query(
      `
      SELECT *
      FROM User
      WHERE username = '${username}'
      `, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          resolve(data.length === 1);
        }
      }); 
    }
  );
}

const registerUser = async function(req, res) {
  const username = req.params.user_name;
  const password = req.params.password;
  const name = req.params.name;
  const email = req.params.email != "NA" ? req.params.email : "";

  const flag = await checkUsernameExists(username);

  if (!flag) {
    const id = crypto.createHash("md5").update(username).digest("hex");
    connection.query(
      `
      INSERT INTO User(id, username, password, name, email)
      VALUES ('${id}', '${username}', '${password}', '${name}', '${email}')
      `, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error inserting user into database.");
          res.json([]);
        } else {
          res.status(200).send("User registered successfully!");
        }
    });
  } else {
    res.status(500).send("ERROR: Username already exists.");
  }
}

const checkForLogin = function(username, password) {
  return new Promise(function(resolve) {
    connection.query(
      `
      SELECT *
      FROM User
      WHERE username = '${username}'
        AND password = '${password}'
      `, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          resolve(data.length === 1);
        }
      }); 
    }
  );
}

const handleLogin = async function(req, res) {
  const username = req.params.user_name;
  const password = req.params.password;

  const flag = await checkForLogin(username, password);
  if (flag) {
    res.status(200).send("User logged in successfully");
  } else {
    res.status(500).send("ERROR: Username and password does not match");
  }
}

const getUserId = async function(req, res) {
  const username = req.params.user_name;
  connection.query(
    `
    SELECT id from User WHERE username = '${username}';
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const addToLibrary = async function(req, res) {
  const user_id = req.params.user_id;
  const book_id = req.params.book_id;

  return new Promise(function(resolve) {
    connection.query(
      `
      INSERT INTO In_Library(user_id, book_id, date_added)
      VALUES ('${user_id}', '${book_id}', CURDATE())
      `, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          resolve(data.length === 1);
        }
      });
    })
}

const removeFromLibrary = async function(req, res) {
  const user_id = req.params.user_id;
  const book_id = req.params.book_id;

  return new Promise(function(resolve) {
    connection.query(
      `
      DELETE FROM In_Library
      WHERE user_id = '${user_id}' AND book_id = '${book_id}'
      `, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          resolve(data.length === 1);
        }
      });
  }) 
}

const checkInLibrary = async function(req, res) {
  const user_id = req.params.user_id;
  const book_id = req.params.book_id;

  connection.query(
    `
    SELECT user_id from In_Library
      WHERE user_id = '${user_id}'
        AND book_id = '${book_id}';
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const checkifReviewExists = function(user_id, book_id) {
  return new Promise(function(resolve) {
    connection.query(
      `
      SELECT *
      FROM Review
      WHERE user_id = '${user_id}'
        AND book_id = '${book_id}'
      `, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          resolve(data.length === 1);
        }
      }); 
    }
  );
}

const updateReview = async function(req, res) {
  const user_id = req.params.user_id;
  const book_id = req.params.book_id;
  const text = "";
  const rating = req.params.rating;
  const num_votes = 0;
  const num_comments = 0;

  const reviewExists = await checkifReviewExists(user_id, book_id);
  if (!reviewExists) {
    const cankey = `${user_id}_${book_id}`
    const id = crypto.createHash("md5").update(cankey).digest("hex");
    connection.query(
      `
      INSERT INTO Review(id, user_id, book_id, text, rating, num_votes, num_comments)
      VALUES ('${id}', '${user_id}', '${book_id}', '${text}', '${rating}', '${num_votes}', '${num_comments}')
      `, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send("Could not add a Review ...");
        } else {
          res.status(200).send("Review successfully added!");
        }
    });
  } else {
    connection.query(
      `
      UPDATE Review
      SET rating = '${rating}'
      WHERE user_id = '${user_id}'
        AND book_id = '${book_id}'
      `, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send("Could not update the Review ...");
        } else {
          res.status(200).send("Review successfully updated!");
        }
    });
  }
}

const getRating = async (req, res) => {
  const user_id = req.params.user_id;
  const book_id = req.params.book_id;
  connection.query(
    `
    SELECT rating from Review
      WHERE user_id = '${user_id}'
        AND book_id = '${book_id}';
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

module.exports = {
  userLibrary,
  userRecommendationsRandom,
  userInformation,
  topReviewers,
  seriesInformation,
  seriesBooks,
  searchSeries,
  bookInformation,
  bookReviews,
  searchBooks,
  authorLNDStatistics,
  searchAuthors,
  randomBook,
  registerUser,
  handleLogin,
  getUserId,
  addToLibrary,
  removeFromLibrary,
  checkInLibrary,
  updateReview,
  getRating,
  bookAuthors
}