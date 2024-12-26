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

    // Handle form submission with WebSocket interaction
    const form = document.getElementById('serviceForm');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
          // Notify WebSocket server
          socket.send(JSON.stringify({
            action: 'user_data',
            name: data.name,
            email: data.email,
            phone: data.phone
          }));

          alert(result.message); // Show success message
          window.location.href = result.redirect; // Redirect to form.html
        } else {
          alert(result.message); // Show error message
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again.');
      }
    });