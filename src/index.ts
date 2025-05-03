import express, { Request, Response } from "express";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream"; //


const app = express();
const port = 3000;


app.use(express.json()); 


const downloadFile = async (url: string): Promise<Readable> => {
  const response = await axios.get(url, {
    responseType: 'stream', 
  });
  return response.data as Readable; 
};


app.post("/convert", async (req: Request, res: Response): Promise<void> => {
  const { fileUrl } = req.body; 
  
  if (!fileUrl) {
    res.status(400).send("No file URL provided");
    return;
  }

  try {
    
    const inputFileStream = await downloadFile(fileUrl);

    
    res.setHeader("Content-Type", "audio/mp3");
    res.setHeader("Content-Disposition", 'attachment; filename="converted.mp3"');

    
    ffmpeg()
      .input(inputFileStream)
      .inputFormat("ogg")  
      .audioCodec("libmp3lame")  
      .audioBitrate(128)  
      .format('mp3')  
      .noVideo()  
      .on("start", (commandLine) => {
        console.log("FFmpeg command:", commandLine); 
      })
      .on("end", () => {
        console.log("Conversion finished.");
      })
      .on("stderr", (stderr) => {
        console.log("FFmpeg STDERR:", stderr); 
      })
      .on("error", (err) => {
        console.error("Error during conversion:", err);
        res.status(500).send("Error converting the file");
      })
      .pipe(res, { end: true });  
  } catch (err) {
    console.error("Error downloading or converting the file:", err);
    res.status(500).send("Error processing the file");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
