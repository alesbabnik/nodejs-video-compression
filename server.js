const express = require("express");
const cors = require("cors");
const { fork } = require("child_process");
const fileUpload = require("express-fileupload");
const fs = require("fs");

// Create a new express application instance
const PORT = 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    tempFileDir: "temp",
    useTempFiles: true,
  })
);

// Routes
app.get("/", (req, res) => {
  // public/upload.html
    res.sendFile(__dirname + "/public/upload.html");

});

app.post("/compress-video", (req, res) => {
  const video = req.files.video;

  // When file is uploaded it is stored in temp file
  // this is made possible by express-fileupload
  const tempFilePath = video.tempFilePath;
    console.log(tempFilePath);
  if (video && tempFilePath) {
    // Create a new child process
    const child = fork("video.js");
    // Send message to child process
    child.send({ tempFilePath, name: video.name });
    // Listen for message from child process
    child.on("message", (message) => {
      const { statusCode, text } = message;
      res.status(statusCode).send(text);
    
    });
  } else {
    res.status(400).send("No file uploaded");
  }
});

app.get("/video", (req, res) => {
    // get all the files in the temp folder
    const files = fs.readdirSync("temp");
    //skip videos that are not mp4
    const videos = files.filter((file) => file.includes(".mp4"));
    res.send(videos);
});

app.get("/video/:name", (req, res) => {
    // get the file from the temp folder
    const { name } = req.params;
    res.sendFile(__dirname + `/temp/${name}`);
});

app.listen(PORT, () => {
  console.log(`Server started on  http://localhost:${PORT}`);
});
