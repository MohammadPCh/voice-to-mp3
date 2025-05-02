import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import streamifier from "streamifier"; // Import streamifier

// Initialize Express app
const app = express();
const port = 3000;

// Set up multer for file upload (store files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to receive and convert the file
app.post("/convert", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).send("No file uploaded");
    return;
  }

  // Temporary output file path
  const outputFilePath = path.join(__dirname, "output.mp3");

  try {
    // Create a Readable stream from the Buffer
    const inputFileStream = streamifier.createReadStream(req.file.buffer);

    // Use ffmpeg to convert the file
    ffmpeg()
      .input(inputFileStream)
      .inputFormat("ogg") // or 'oga' based on your input file
      .audioCodec("libmp3lame")
      .on("end", () => {
        // Send the converted file back to the client
        res.download(outputFilePath, "converted.mp3", (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error sending the file");
          }
          // Clean up the temporary file
          fs.unlinkSync(outputFilePath);
        });
      })
      .on("error", (err) => {
        console.error(err);
        res.status(500).send("Error converting the file");
      })
      .save(outputFilePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Unexpected error occurred during file processing");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
