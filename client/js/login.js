document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtener los valores del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mensaje de error
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = ''; // Limpiar mensajes anteriores

    try {
        // Enviar la solicitud al backend
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar tokens en localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Redirigir al usuario a la página principal
            window.location.href = 'feed.html';
        } else {
            // Mostrar mensaje de error
            messageDiv.textContent = data.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error de conexión con el servidor';
    }
});