Twitter Scraper App
This Node.js application scrapes posts from a Twitter channel and performs various tasks such as saving the posts to a PostgreSQL database, saving images locally, and sending emails for posts with videos.

Features
Scrape Twitter Posts: Scrapes posts from a specified Twitter channel.
Save to Database: Saves the scraped posts to a PostgreSQL database.
Save Images Locally: Saves images from the posts to a local directory.
Send Email Notifications: Sends email notifications for posts with videos.
Installation
Clone the repository:


git clone https://github.com/your-username/twitter-scraper-app.git
Install dependencies:


cd twitter-scraper-app
npm install
Set up environment variables:Create a .env file in the root directory and add the following environment variables:
env

DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=your_database_port
SENDER_EMAIL_ID=your_sender_email_id
SENDER_EMAIL_PASSWORD=your_sender_email_password
RECEIPIENT_EMAIL_ID=your_recipient_email_id
Start the server:


npm start
Usage
Access the application by navigating to http://localhost:3000/tweets in your browser.
The application will scrape Twitter posts from the specified channel and perform the defined tasks.
Technologies Used
Node.js
Express.js
Puppeteer
PostgreSQL
Nodemailer
Contributing
Contributions are welcome! Fork the repository, make your changes, and submit a pull request.

License
This project is licensed under the MIT License.

