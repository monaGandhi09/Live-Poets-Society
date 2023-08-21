SHOW DATABASES;

CREATE DATABASE CIS5500Project;

USE CIS5500Project;

CREATE TABLE Book(
    id INT,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    language_code VARCHAR(10),
    edition VARCHAR(150),
    format VARCHAR(50),
    is_ebook BOOL,
    isbn VARCHAR(10),
    isbn13 VARCHAR(13),
    asin VARCHAR(10),
    kindle_asin VARCHAR(10),
    publisher VARCHAR(150),
    publish_date DATE,
    num_pages INT,
    image_url VARCHAR(150),
    PRIMARY KEY(id),
    CONSTRAINT CHK_BOOK_TITLE CHECK (LENGTH(title) > 0),
    CONSTRAINT CHK_BOOK_ISBN CHECK (isbn IS NULL OR LENGTH(isbn) = 10),
    CONSTRAINT CHK_BOOK_ISBN13 CHECK (isbn13 IS NULL OR LENGTH(isbn13) = 13),
    CONSTRAINT CHK_BOOK_ASIN CHECK (asin IS NULL OR LENGTH(asin) = 10),
    CONSTRAINT CHK_BOOK_KASIN CHECK (kindle_asin IS NULL OR LENGTH(kindle_asin) = 10),
    CONSTRAINT CHK_BOOK_PUBLISH_DATE CHECK (publish_date <= SYSDATE()),
    CONSTRAINT CHK_BOOK_NUM_PAGES CHECK (num_pages IS NULL OR num_pages > 0)
);

CREATE TABLE Similar_Books(
    book_id1 INT,
    book_id2 INT,
    PRIMARY KEY(book_id1, book_id2),
    FOREIGN KEY(book_id1) REFERENCES Book(id),
    FOREIGN KEY(book_id2) REFERENCES Book(id)
);

CREATE TABLE Series(
    id INT,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    numbered BOOL,
    PRIMARY KEY(id),
    CONSTRAINT CHK_SERIES_TITLE CHECK(LENGTH(title) > 0)
);

CREATE TABLE In_Series(
    book_id INT,
    series_id INT,
    PRIMARY KEY(book_id, series_id),
    FOREIGN KEY(book_id) REFERENCES Book(id),
    FOREIGN KEY(series_id) REFERENCES Series(id)
);

CREATE TABLE Author(
    id INT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT CHK_AUTHOR_NAME CHECK (LENGTH(name) > 0)
);

CREATE TABLE Written_By(
    book_id INT,
    author_id INT,
    PRIMARY KEY(book_id, author_id),
    FOREIGN KEY(book_id) REFERENCES Book(id),
    FOREIGN KEY(author_id) REFERENCES Author(id)
);

CREATE TABLE Series_By(
    series_id int,
    author_id int,
    PRIMARY KEY(series_id, author_id),
    FOREIGN KEY(series_id) REFERENCES Series(id),
    FOREIGN KEY(author_id) REFERENCES Author(id)
);

CREATE TABLE User(
    id VARCHAR(32),
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(25) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50),
    PRIMARY KEY(id),
    CONSTRAINT CHK_USER_ID CHECK (LENGTH(id) = 32),
    CONSTRAINT CHK_USER_USERNAME CHECK (LENGTH(username) > 0),
    CONSTRAINT CHK_USER_PASSWORD CHECK (LENGTH(password) > 0),
    CONSTRAINT CHK_USER_NAME CHECK (LENGTH(name) > 0)
);

CREATE TABLE In_Library(
    user_id VARCHAR(32),
    book_id INT,
    date_added DATETIME,
    read_at DATETIME,
    started_at DATETIME,
    PRIMARY KEY(user_id, book_id),
    FOREIGN KEY(user_id) REFERENCES User(id),
    FOREIGN KEY(book_id) REFERENCES Book(id),
    CONSTRAINT CHK_IN_LIBRARY_USER_ID CHECK (LENGTH(user_id) = 32),
    CONSTRAINT CHK_IN_LIBRARY_DATE_ADDED CHECK (date_added <= SYSDATE()),
    CONSTRAINT CHK_IN_LIBRARY_READ_AT CHECK (read_at <= SYSDATE()),
    CONSTRAINT CHK_IN_LIBRARY_STARTED_AT CHECK (started_at <= SYSDATE())
);

CREATE TABLE Review(
    id VARCHAR(32),
    user_id VARCHAR(32) NOT NULL,
    book_id INT NOT NULL,
    text TEXT,
    rating INT,
    num_votes INT NOT NULL,
    num_comments INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES User(id),
    FOREIGN KEY(book_id) REFERENCES Book(id),
    CONSTRAINT CHK_REVIEW_ID CHECK (LENGTH(id) = 32),
    CONSTRAINT CHK_REVIEW_USER_ID CHECK (LENGTH(user_id) = 32),
    CONSTRAINT CHK_REVIEW_RATING CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
    CONSTRAINT CHK_REVIEW_NUM_VOTES CHECK (num_votes >= 0),
    CONSTRAINT CHK_REVIEW_NUM_COMMENTS CHECK (num_comments >= 0),
    CONSTRAINT CHECK_USER_ID_BOOK_ID UNIQUE (user_id, book_id)
);

CREATE TABLE ABRU_View (
    SELECT A.id author_id,
           A.name author_name,
           R.book_id book_id,
           R.id review_id,
           R.user_id user_id,
           R.rating rating
    FROM Author A
         JOIN Written_By WB on A.id = WB.author_id
         JOIN Review R on WB.book_id = R.book_id
);

CREATE INDEX AU_Index ON ABRU_View(author_id, user_id);
CREATE INDEX Rating_Index ON ABRU_View(rating);