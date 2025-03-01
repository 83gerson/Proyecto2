document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const biografia = document.getElementById('biografia').value;

    // Mensaje de error
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = ''; // Limpiar mensajes anteriores

    try {
        // Enviar la solicitud al backend
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password, biografia }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar tokens en localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Redirigir al usuario a la página principal
            window.location.href = 'home.html';
        } else {
            // Mostrar mensaje de error
            messageDiv.textContent = data.message || 'Error al registrar el usuario';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error de conexión con el servidor';
    }
});