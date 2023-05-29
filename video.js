const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

process.on("message", (payload) => {
  const { tempFilePath, name } = payload;
  const bitrate = 1000;

  const endProcess = (endPayload) => {
    const { statusCode, text } = endPayload;
    // Remove temp file
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        process.send({ statusCode: 500, text: err.message });
      }
    });
    // Format response so it fits the api response
    process.send({ statusCode, text });
    // End process
    process.exit();
  };

  // Process video and send back the result
  ffmpeg(tempFilePath)
    .fps(30)
    .format('mp4')
    .outputOptions(['-c:v libx264', `-b:v ${bitrate}k`, '-c:a aac', '-b:a 58k'])
    .addOptions(["-crf 28"])
    .on("end", () => {
      endProcess({ statusCode: 200, text: "Success" });
    })
    .on("error", (err) => {
      endProcess({ statusCode: 500, text: err.message });
    })
    .save(`./temp/${name}.mp4`);
});
