const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Get the local IP address of the machine
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Get the local IP address
const localIP = getLocalIPAddress();

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to serve form.html
app.get('/form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Handle form submission and save data
app.post('/submit-form', (req, res) => {
  const { name, email, phone } = req.body;

  // Validate data
  if (!name || !email || !phone) {
    return res.status(400).send('All fields are required!');
  }

  // Save data to a JSON file
  const dataPath = path.join(__dirname, 'users.json');
  const userData = { name, email, phone };

  fs.readFile(dataPath, 'utf8', (err, data) => {
    let users = [];
    if (!err && data) {
      users = JSON.parse(data);
    }
    users.push(userData);

    fs.writeFile(dataPath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Error saving data:', err);
        return res.status(500).send('Error saving data.');
      }

      console.log('User data saved successfully.');

      // Find the matching image in the images folder based on name, email, or phone
      const imagesFolder = path.join(__dirname, 'public/images');
      const sanitizedFields = [name, email, phone].map(field => field.toLowerCase());

      const matchingFile = fs.readdirSync(imagesFolder).find((file) => {
        const fileNameWithoutExt = path.parse(file).name.toLowerCase(); // Match without extension
        return sanitizedFields.some(field => fileNameWithoutExt.includes(field.toLowerCase())); // Match any field
      });

      // Redirect to screen.html with the matching image file name
      if (matchingFile) {
        const imageFile = `/images/${matchingFile}`;
        res.redirect(`/screen.html?image=${encodeURIComponent(imageFile)}`);
      } else {
        res.redirect(`/screen.html?image=`); // No image found, pass empty value
      }
    });
  });
});

// Route to serve screen.html from outside public folder
app.get('/screen.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'screen.html')); // Adjust the path to where your screen.html is located
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://${localIP}:${port}`);
});
