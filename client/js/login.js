document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    try {
        console.log("Enviando solicitud de login...");

        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (response.ok) {
            console.log("Inicio de sesión exitoso");

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            console.log("Tokens guardados en localStorage");

            // Redirigir al feed
            console.log("Redirigiendo a feed.html...");
            window.location.href = 'feed.html';
        } else {
            console.error("Error en el login:", data.message);
            messageDiv.textContent = data.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error de conexión con el servidor';
    }
});