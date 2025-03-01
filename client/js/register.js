document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtiene los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const biografia = document.getElementById('biografia').value;
    const avatar = document.getElementById('avatar').value; // Obtiene el valor del avatar seleccionado

    // Mensaje de error
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = ''; // Limpiar mensajes anteriores

    try {
        // Envía la solicitud al backend
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password, biografia, avatar }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guarda tokens en localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Redirige al usuario a la página principal
            window.location.href = 'login.html';
        } else {
            messageDiv.textContent = data.message || 'Error al registrar el usuario';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error de conexión con el servidor';
    }
});

document.querySelectorAll('.avatar').forEach(img => {
    img.addEventListener('click', (e) => {
        document.querySelectorAll('.avatar').forEach(avatar => avatar.classList.remove('selected'));
        e.target.classList.add('selected');
        document.getElementById('avatar').value = e.target.dataset.avatar;
    });
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const biografia = document.getElementById('biografia').value;
    const avatar = document.getElementById('avatar').value; // Obtiene el valor del avatar seleccionado

    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password, biografia, avatar }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            window.location.href = 'login.html';
        } else {
            messageDiv.textContent = data.message || 'Error al registrar el usuario';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Error de conexión con el servidor';
    }
});