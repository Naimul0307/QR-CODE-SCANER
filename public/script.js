// Function to get the base IP address dynamically
function getBaseURL() {
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
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
    }
  });
}

// Function to generate the Access QR code
function generateAccessQRCode() {
  const pagePath = document.getElementById('pagePath').value;

  if (!pagePath) {
    alert('Please enter a page path.');
    return;
  }

  // Get base URL dynamically
  const baseURL = getBaseURL();
  const fullURL = `${baseURL}${pagePath}`;

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
    }
  });
}

// Event listeners for buttons
document.getElementById('generateWiFiBtn').addEventListener('click', generateWiFiQRCode);
document.getElementById('generateAccessBtn').addEventListener('click', generateAccessQRCode);
