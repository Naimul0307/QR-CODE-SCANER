const fs = require('fs');
const path = require('path');
const net = require('net');

// Path to the .env file
const envPath = path.join(__dirname, '.env');

// Find an available port
function findAvailablePort(startingPort = 3000) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(startingPort, () => {
      server.once('close', () => resolve(startingPort));
      server.close();
    });

    server.on('error', () => resolve(findAvailablePort(startingPort + 1)));
  });
}

// Update the .env file with the new port
async function updateEnvFile() {
  const port = await findAvailablePort();
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/PORT=\d+/g, `PORT=${port}`);
  } else {
    envContent = `PORT=${port}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`Updated .env with PORT=${port}`);
}

// Run the update function
updateEnvFile();
