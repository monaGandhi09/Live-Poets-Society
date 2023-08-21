# Live Poets Society
This is our take on Goodreads but specifically for fans of poetry.

For a detailed information about the process of creating and optimizing queries please look at: [Report](LivePoetsSocietyReport.pdf). We also created a presentation and a demo of the platform for better understanding of the working, you can take a look here: 
[Presentation](LivePoetsSocietyPresentation.pdf) and 
[Demo](LivePoetsSocietyDemo.mp4).

## File Structure
The file structure of this project is as follows:
- `data_setup`: This directory contains the preprocessing code.
    - `requirements.txt`: List of Python dependencies for preprocessing
    - `statistics.ipynb`: Contains basic EDA code
    - `preprocessing.ipynb`: Contains the preprocessing/cleaning code
    - `ddl.sql`: Contains the DDL code to initialize the database
- `client`: This directory contains the client-side code.
    - `src`: This directory contains the src files for the client-side code.
        - `components`: This file contains React components used for the website.
            - `Alert.js`: This file contains code for an alert popup used when logging in and registering.
            - `BookInfo.js`: This file contains code for a modal to display info about a particular book.
            - `NavBar.js`: This file contains code for the website's NavBar
            - `SeriesInfo.js`: This file contains code for a modal to display info about a particular series.
        - `helpers`: This directory contains helper files for the client-side.
            - `processData.js`: This file contains a function to clean up null and empty string data values.
        - `pages`: This directory contains code for the different pages of our website.
             - `AuthorsPage.js`
            - `BooksPage.js`
            - `LoginPage.js`
            - `RegisterPage.js`
            - `ReviewsPage.js`
            - `SeriesPage`
            - `TrendingPage.js`
            - `UserPage`
            - `EmptyPage.js`: This contains code for the page displayed when one attempts to use the website while not logged in.
        - `styles`: This directory contains code for styling various parts of our website.
            - `App.css`
        - `App.js`: Main .js file for client-side code.
        - `config.json`: config file for client-side dependencies
- `server`: This folder contains the server-side code.
    - `routes.js`: This file contains all of the routes for the server-side and their SQL queries
    - `server.js`: This file starts the server and listens for incoming requests.

## Installation
To install the dependencies for this project, run `npm install` in the root/client/server directories of the project.

## Running Locally
To run the server side, run `npm start` in the server directory of the project. The application will be served at http://localhost:8080.

To run the client side, run `npm start` in the client directory of the project. The application will be served at http://localhost:3000.



