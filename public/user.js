document.getElementById('userForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Send data to the server
    const response = await fetch('/save-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone }),
    });

    if (response.ok) {
      // Redirect to screen.html on success
      window.location.href = '/screen.html';
    } else {
      alert('Failed to save data.');
    }
  });