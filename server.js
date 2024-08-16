const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('pdf'), async (req, res) => {
  const filePath = req.file.path;
  const fileType = path.extname(req.file.originalname).toLowerCase();

  try {
    let extractedText = '';
    if (fileType === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (fileType === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (fileType === '.doc' || fileType === '.txt') {
      extractedText = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (error, text) => {
          if (error) return reject(error);
          resolve(text);
        });
      });
    } else {
      return res.status(400).send('Unsupported file type.');
    }

    fs.unlinkSync(filePath); // Clean up the uploaded file
    res.send({ text: extractedText });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error extracting text.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
