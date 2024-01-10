import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import PDFMerger from 'pdf-merger-js';
import fs from 'fs';

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
}

// Enable CORS
app.use(cors(corsOptions));
const merger = new PDFMerger();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.originalname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

let lastMergedFilePath ;
// Define a route for file uploads and merging
app.post('/', upload.array('files'), async (req, res) => {
    // Get the paths of the uploaded files
    const filePaths = req.files.map(file => file.path);

    // Get the original names of the uploaded files
    const originalNames = req.files.map(file => path.basename(file.originalname, path.extname(file.originalname))).join('-'); 

    const mergedFileName = originalNames + '-' + Date.now() + '.pdf';
    // Merge the PDF files
    lastMergedFilePath = `tmp/${mergedFileName}`;
    try {
        for (const path of filePaths) {
            await merger.add(path);
        }
        await merger.save(lastMergedFilePath); //save under given name and reset the internal document
        const absolutePath = path.resolve(lastMergedFilePath);
        return res.json({ message: 'Files merged successfully', path: absolutePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error merging files' });
    }
});

app.get('/download', (req, res) => {
    const file = lastMergedFilePath;
   if (!file) {
        res.status(400).json({ message: 'No file to download' });
    }   
    res.download(file,(error)=>{
        if(error){
            res.status(500).json({ message: 'Error downloading file' });
        }else{
            //delete file after download
            fs.unlink(file, (err) => {
                if (err) {
                    console.error(err)
                    return
                }else{
                    console.log('file deleted successfully');}
            })

        }
        
    
    }); // Set disposition and send it.
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});