let socket;

// Establish WebSocket connection
if (!window.socket || window.socket.readyState !== WebSocket.OPEN) {
  socket = new WebSocket('ws://' + window.location.hostname + ':3000');
  window.socket = socket;
}

socket.onopen = () => {
  console.log('WebSocket connection established!');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Redirect to screen.html after receiving action from server
  if (data.action === 'show_screen' && data.redirect) {
    window.location.href = '/screen.html'; // Automatically navigate to screen.html
  }
};

// Dynamically detect and display the Base URL
window.onload = () => {
  const baseURL = getBaseURL();
  document.getElementById('baseURL').value = baseURL; // Populate the auto-detected IP in the input field
};

// Function to get the base IP address dynamically
function getBaseURL() {
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
}

// Function to generate the Access QR code
function generateAccessQRCode() {
  const pagePath = document.getElementById('pagePath').value.trim();
  const baseURL = document.getElementById('baseURL').value;

  if (!pagePath) {
    alert('Please enter a page path.');
    return;
  }

  // Ensure the page path starts with '/'
  const sanitizedPagePath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;

  // Generate the full URL
  const fullURL = `${baseURL}${sanitizedPagePath}`;

  // Create QR Code for the Access URL
  const qrCodeContainer = document.getElementById('accessQRCode');
  qrCodeContainer.innerHTML = ''; // Clear previous QR code

  const canvas = document.createElement('canvas');
  qrCodeContainer.appendChild(canvas);

  QRCode.toCanvas(canvas, fullURL, { width: 256, margin: 1 }, function (error) {
    if (error) {
      console.error(error);
      alert('Failed to generate access QR code.');
    } else {
      console.log(`Access QR code generated successfully for URL: ${fullURL}`);
      document.getElementById('accessTitle').innerText = 'Access QR Code';
      document.getElementById('accessQRCode').style.display = 'block'; // Show the QR code
      document.getElementById('goToScreenBtn').style.display = 'block'; // Show the "Go to Screen" button
    }
  });
}

// Function to generate the Wi-Fi QR code
function generateWiFiQRCode() {
  const ssid = document.getElementById('ssid').value;
  const password = document.getElementById('password').value;
  const encryption = document.getElementById('encryption').value;

  if (!ssid) {
    alert('Please enter the Wi-Fi SSID.');
    return;
  }

  // Wi-Fi QR code format: WIFI:T:<encryption>;S:<SSID>;P:<password>;H:<hidden>;;
  const hidden = 'false'; // Set to 'true' if the network is hidden
  const qrCodeData = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;

  // Create QR Code for Wi-Fi
  const qrCodeContainer = document.getElementById('wifiQRCode');
  qrCodeContainer.innerHTML = ''; // Clear previous QR code

  const canvas = document.createElement('canvas');
  qrCodeContainer.appendChild(canvas);

  QRCode.toCanvas(canvas, qrCodeData, { width: 256, margin: 1 }, function (error) {
    if (error) {
      console.error(error);
      alert('Failed to generate Wi-Fi QR code.');
    } else {
      console.log('Wi-Fi QR code generated successfully');
      document.getElementById('wifiTitle').innerText = 'Network QR Code';
      document.getElementById('wifiQRCode').style.display = 'block'; // Show the QR code
      document.getElementById('goToScreenBtn').style.display = 'block'; // Show the "Go to Screen" button
    }
  });
}

// Event listeners for buttons
document.getElementById('generateWiFiBtn').addEventListener('click', () => {
  generateWiFiQRCode();
  document.getElementById('wifiForm').style.display = 'none'; // Hide Wi-Fi form
});

document.getElementById('generateAccessBtn').addEventListener('click', () => {
  generateAccessQRCode();
  document.getElementById('accessForm').style.display = 'none'; // Hide Access form
});
