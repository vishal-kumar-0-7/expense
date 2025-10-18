import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// serve static files from the "public" folder inside expense
app.use(express.static(path.join(__dirname, 'public')));

// serve index from the same folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`server is running on port : ${PORT}`);
});