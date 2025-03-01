document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un token de acceso almacenado
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.href = 'index.html';
        return;
    }

    console.log("Token de acceso:", accessToken);

    // Configurar el botón de notificaciones
    const notificationsButton = document.getElementById('notificationsButton');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    if (notificationsButton) {
        notificationsButton.addEventListener('click', () => {
            notificationsDropdown.classList.toggle('show');
        });
    }

    // Configurar la barra de búsqueda
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            searchFriends(searchInput.value);
        });
    }

    // Cargar los datos iniciales
    loadFeed();
    loadNotifications();
    
    // Nueva publicación
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const contenido = document.getElementById('postContent').value;
            
            if (!contenido.trim()) {
                alert('El contenido no puede estar vacío');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/posts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ contenido })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    document.getElementById('postContent').value = '';
                    loadFeed(); // Recargar el feed
                } else {
                    alert(data.message || 'Error al crear la publicación');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }
});

// Función para cargar el feed de publicaciones
async function loadFeed() {
    const feedDiv = document.getElementById('feedContent');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!feedDiv) return;
    
    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar las publicaciones');
        }

        const posts = await response.json();
        
        // Limpiar el feed
        feedDiv.innerHTML = '';
        
        // Crear el formulario para publicar si no existe
        if (!document.getElementById('createPostForm')) {
            const postFormHTML = `
                <div class="create-post">
                    <h3>¿Qué estás pensando?</h3>
                    <form id="createPostForm">
                        <textarea id="postContent" placeholder="Escribe algo..."></textarea>
                        <button type="submit">Publicar</button>
                    </form>
                </div>
            `;
            feedDiv.innerHTML = postFormHTML;
            
            // Volver a agregar el event listener
            document.getElementById('createPostForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const contenido = document.getElementById('postContent').value;
                
                if (!contenido.trim()) {
                    alert('El contenido no puede estar vacío');
                    return;
                }
                
                try {
                    const response = await fetch('http://localhost:3000/api/posts', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ contenido })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        document.getElementById('postContent').value = '';
                        loadFeed(); // Recargar el feed
                    } else {
                        alert(data.message || 'Error al crear la publicación');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión con el servidor');
                }
            });
        }
        
        // Mostrar las publicaciones
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            
            // Autor info
            let authorName = 'Usuario desconocido';
            let authorAvatar = 'https://via.placeholder.com/40';
            
            if (post.autor && typeof post.autor === 'object') {
                authorName = post.autor.nombre || 'Sin nombre';
                authorAvatar = post.autor.avatar || 'https://via.placeholder.com/40';
            }
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${authorAvatar}" alt="Avatar" class="post-avatar">
                    <span class="post-author">${authorName}</span>
                </div>
                <div class="post-content">${post.contenido}</div>
                <div class="post-actions">
                    <button class="like-button" data-post-id="${post._id}">
                        Like (${post.likes ? post.likes.length : 0})
                    </button>
                    <button class="comment-button" data-post-id="${post._id}">
                        Comentar
                    </button>
                </div>
            `;
            
            feedDiv.appendChild(postElement);
        });
        
        // Agregar event listeners a los botones de like y comentar
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', () => {
                likePost(button.getAttribute('data-post-id'));
            });
        });
        
        document.querySelectorAll('.comment-button').forEach(button => {
            button.addEventListener('click', () => {
                commentPost(button.getAttribute('data-post-id'));
            });
        });
        
    } catch (error) {
        console.error('Error al cargar el feed:', error);
        feedDiv.innerHTML = `<p class="error-message">Error al cargar las publicaciones: ${error.message}</p>`;
    }
}

// Función para cargar notificaciones
async function loadNotifications() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!notificationsDropdown) return;
    
    try {
        const response = await fetch('http://localhost:3000/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar las notificaciones');
        }

        const notifications = await response.json();
        
        // Limpiar notificaciones
        notificationsDropdown.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationsDropdown.innerHTML = '<p class="no-notifications">No tienes notificaciones</p>';
            return;
        }
        
        // Mostrar notificaciones
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification');
            
            // Comprobar que el usuario origen esté definido correctamente
            let fromUserName = 'Usuario';
            if (notification.usuarioOrigen && typeof notification.usuarioOrigen === 'object') {
                fromUserName = notification.usuarioOrigen.nombre || 'Usuario';
            }
            
            notificationElement.innerHTML = `
                <p>${notification.contenido}</p>
                <span class="notification-time">
                    ${new Date(notification.createdAt).toLocaleString()}
                </span>
            `;
            
            notificationsDropdown.appendChild(notificationElement);
        });
        
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        notificationsDropdown.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }
}

// Función para buscar amigos
async function searchFriends(query) {
    if (!query.trim()) return;
    
    const accessToken = localStorage.getItem('accessToken');
    const friendsListDiv = document.getElementById('friendsList');
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/search-friends?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al buscar amigos');
        }

        const users = await response.json();
        
        // Limpiar y mostrar resultados
        friendsListDiv.innerHTML = '<h3>Resultados de búsqueda</h3>';
        
        if (users.length === 0) {
            friendsListDiv.innerHTML += '<p>No se encontraron usuarios</p>';
            return;
        }
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('friend-result');
            userElement.innerHTML = `
                <img src="${user.avatar || 'https://via.placeholder.com/40'}" alt="Avatar" class="friend-avatar">
                <span class="friend-name">${user.nombre}</span>
                <button class="add-friend-btn" data-user-id="${user._id}">Agregar</button>
            `;
            friendsListDiv.appendChild(userElement);
        });
        
        // Agregar event listeners a los botones de agregar amigo
        document.querySelectorAll('.add-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                addFriend(button.getAttribute('data-user-id'));
            });
        });
        
    } catch (error) {
        console.error('Error al buscar amigos:', error);
        friendsListDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }
}

// Función para dar like a una publicación
async function likePost(postId) {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al dar like');
        }

        // Recargar el feed para mostrar el cambio
        loadFeed();
        
    } catch (error) {
        console.error('Error al dar like:', error);
        alert(`Error al dar like: ${error.message}`);
    }
}

// Función para comentar una publicación
async function commentPost(postId) {
    const accessToken = localStorage.getItem('accessToken');
    const comentario = prompt('Escribe tu comentario:');
    
    if (!comentario || !comentario.trim()) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contenido: comentario })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al comentar');
        }

        // Recargar el feed para mostrar el comentario
        loadFeed();
        
    } catch (error) {
        console.error('Error al comentar:', error);
        alert(`Error al comentar: ${error.message}`);
    }
}

// Función para enviar solicitud de amistad
async function addFriend(friendId) {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch('http://localhost:3000/api/users/add-friend', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ friendId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al enviar solicitud de amistad');
        }

        const data = await response.json();
        alert(data.message || 'Solicitud de amistad enviada');
        
    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = 'login.html';
}

// Cerrar dropdown de notificaciones cuando se hace clic fuera
window.addEventListener('click', (event) => {
    const dropdown = document.getElementById('notificationsDropdown');
    const button = document.getElementById('notificationsButton');
    
    if (dropdown && button && dropdown.classList.contains('show') && 
        !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});