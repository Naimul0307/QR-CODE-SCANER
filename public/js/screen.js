let socket;

    function initializeWebSocket() {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        socket = new WebSocket('ws://' + window.location.hostname + ':3000');
      }

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onclose = () => {
        console.log('WebSocket closed, reconnecting...');
        setTimeout(initializeWebSocket, 1000); // Try to reconnect after 1 second
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'show_screen') {
          // Clear previous content (if any)
          document.getElementById('userInfo').innerHTML = '';
          document.getElementById('userImage').innerHTML = '';

          // Display user info
          const userInfo = `
            <strong>Name:</strong> ${data.name}<br>
            <strong>Email:</strong> ${data.email}<br>
            <strong>Phone:</strong> ${data.phone}
          `;
          document.getElementById('userInfo').innerHTML = userInfo;

          // Display image if available
          if (data.image) {
            const imgElement = document.createElement('img');
            imgElement.src = data.image;
            imgElement.alt = 'User Image'; // Provide an alt text for the image
            document.getElementById('userImage').appendChild(imgElement);
          } else {
            document.getElementById('userImage').innerHTML = 'No image available.';
          }
        }
      };
    }

    initializeWebSocket();