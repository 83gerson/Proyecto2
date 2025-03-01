document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un token de acceso almacenado
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.href = 'index.html';
        return;
    }

    console.log("Token de acceso:", accessToken);

    // Configura el botón de notificaciones
    const notificationsButton = document.getElementById('notificationsButton');
    const notificationsDropdown = document.getElementById('notificationsDropdown');

    if (notificationsButton) {
        notificationsButton.addEventListener('click', () => {
            notificationsDropdown.classList.toggle('show');

            // Recarga las notificaciones cuando se abre el dropdown
            if (notificationsDropdown.classList.contains('show')) {
                loadNotifications();
            }
        });

        // Cierra el dropdown cuando se hace clic fuera de él
        document.addEventListener('click', (event) => {
            if (!notificationsButton.contains(event.target) && !notificationsDropdown.contains(event.target)) {
                notificationsDropdown.classList.remove('show');
            }
        });
    }

    // Configuración de la barra de búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            searchFriends(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchFriends(searchInput.value);
            }
        });
    }

    // Configuración del botón de perfil
    const profileButton = document.getElementById('profileButton');
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // Cargar los datos iniciales
    initCreatePostForm();
    loadFeed();
    loadFriendsList();
    loadNotifications();

    // Configura un intervalo para verificar notificaciones cada minuto
    setInterval(loadNotifications, 60000);

    // Nueva publicación
    function initCreatePostForm() {
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Form submitted");

                const contenido = document.getElementById('postContent').value;
                console.log("Content:", contenido);

                if (!contenido.trim()) {
                    alert('El contenido no puede estar vacío');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/posts/create', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ contenido })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        document.getElementById('postContent').value = ''; // Limpiar el campo de texto
                        alert('Publicación creada exitosamente');
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
    }
});

// Función para cargar el feed de publicaciones
async function loadFeed() {
    const feedDiv = document.getElementById('feedContent');
    const accessToken = localStorage.getItem('accessToken');

    if (!feedDiv) return;

    try {
        // Obtiene las publicaciones de los amigos
        const postsResponse = await fetch('http://localhost:3000/api/posts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!postsResponse.ok) {
            const errorData = await postsResponse.json();
            throw new Error(errorData.message || 'Error al cargar las publicaciones');
        }

        const posts = await postsResponse.json();

        // Obtiene las páginas sugeridas
        const pagesResponse = await fetch('http://localhost:3000/api/pages', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!pagesResponse.ok) {
            const errorData = await pagesResponse.json();
            throw new Error(errorData.message || 'Error al cargar las páginas sugeridas');
        }

        const pages = await pagesResponse.json();

        // Ordena las publicaciones de la más nueva a la más vieja
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Limpiar el feed
        feedDiv.innerHTML = '';

        // Muestra las páginas sugeridas en un carrusel horizontalmente
        if (pages.length > 0) {
            const carouselDiv = document.createElement('div');
            carouselDiv.classList.add('carousel');

            // Divide las páginas en grupos de 3
            const pageGroups = [];
            for (let i = 0; i < pages.length; i += 3) {
                pageGroups.push(pages.slice(i, i + 3));
            }

            // Crea un grupo de páginas por cada sección del carrusel
            pageGroups.forEach((group, index) => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('page-group');

                group.forEach(page => {
                    const pageCard = document.createElement('div');
                    pageCard.classList.add('page-card');
                    pageCard.innerHTML = `
                        <div class="page-info">
                            <span class="page-name">${page.nombre}</span>
                            <p class="page-description">${page.descripcion}</p>
                        </div>
                        <button class="follow-page-btn" data-page-id="${page._id}">Seguir</button>
                    `;
                    groupDiv.appendChild(pageCard);
                });

                carouselDiv.appendChild(groupDiv);
            });

            feedDiv.appendChild(carouselDiv);

            // Lógica para el desplazamiento táctil
            let isDragging = false;
            let startX = 0;
            let scrollLeft = 0;

            carouselDiv.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - carouselDiv.offsetLeft;
                scrollLeft = carouselDiv.scrollLeft;
                carouselDiv.style.cursor = 'grabbing'; // Cambia el cursor al arrastrar
            });

            carouselDiv.addEventListener('mouseleave', () => {
                isDragging = false;
                carouselDiv.style.cursor = 'grab'; // Restaura el cursor
            });

            carouselDiv.addEventListener('mouseup', () => {
                isDragging = false;
                carouselDiv.style.cursor = 'grab'; // Restaura el cursor
            });

            carouselDiv.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - carouselDiv.offsetLeft;
                const walk = (x - startX) * 2; // Ajusta la velocidad del desplazamiento
                carouselDiv.scrollLeft = scrollLeft - walk;
            });

            // Lógica para touch en celular
            carouselDiv.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].pageX - carouselDiv.offsetLeft;
                scrollLeft = carouselDiv.scrollLeft;
            });

            carouselDiv.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const x = e.touches[0].pageX - carouselDiv.offsetLeft;
                const walk = (x - startX) * 2; // Ajusta la velocidad del desplazamiento
                carouselDiv.scrollLeft = scrollLeft - walk;
            });

            carouselDiv.addEventListener('touchend', () => {
                isDragging = false;
            });
        } else {
            feedDiv.innerHTML += '<p>No hay páginas sugeridas.</p>';
        }

        // Mostrar las publicaciones
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');

            // Información del autor
            let authorName = 'Usuario desconocido';
            let authorAvatar = 'https://via.placeholder.com/40';

            if (post.autor && typeof post.autor === 'object') {
                authorName = post.autor.nombre || 'Sin nombre';
                authorAvatar = post.autor.avatar || 'https://via.placeholder.com/40';
            }

            // Comentarios inicialmente ocultos
            const commentsHTML = post.comentarios.map(comment => {
                // Datos del autor del comentario
                let commentAuthorName = 'Usuario desconocido';
                let commentAuthorAvatar = 'https://via.placeholder.com/30';

                if (comment.usuario && typeof comment.usuario === 'object') {
                    commentAuthorName = comment.usuario.nombre || 'Sin nombre';
                    commentAuthorAvatar = comment.usuario.avatar || 'https://via.placeholder.com/30';
                }

                return `
                    <div class="comment">
                        <img src="${commentAuthorAvatar}" alt="Avatar" class="comment-avatar">
                        <div class="comment-content">
                            <span class="comment-author">${commentAuthorName}</span>
                            <p>${comment.contenido}</p>
                        </div>
                    </div>
                `;
            }).join('');

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
                    <button class="toggle-comments-button" data-post-id="${post._id}">
                        Ver comentarios
                    </button>
                </div>
                <div class="comments" id="comments-${post._id}" style="display: none;">
                    ${commentsHTML}
                </div>
            `;

            feedDiv.appendChild(postElement);
        });

        // Agrega event listeners a los botones de like y comentar
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

        // Agrega event listeners a los botones de mostrar/ocultar comentarios
        document.querySelectorAll('.toggle-comments-button').forEach(button => {
            button.addEventListener('click', () => {
                const postId = button.getAttribute('data-post-id');
                const commentsDiv = document.getElementById(`comments-${postId}`);

                if (commentsDiv.style.display === 'none') {
                    commentsDiv.style.display = 'block';
                    button.textContent = 'Ocultar comentarios';
                } else {
                    commentsDiv.style.display = 'none';
                    button.textContent = 'Ver comentarios';
                }
            });
        });

        // Agrega event listeners a los botones de seguir página
        document.querySelectorAll('.follow-page-btn').forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.getAttribute('data-page-id');
                followPage(pageId);
            });
        });

    } catch (error) {
        console.error('Error al cargar el feed:', error);
        feedDiv.innerHTML = `<p class="error-message">Error al cargar las publicaciones: ${error.message}</p>`;
    }
}

// Función para seguir una página
async function followPage(pageId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`http://localhost:3000/api/pages/${pageId}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al seguir la página');
        }

        // Recarga el feed después de seguir la página
        loadFeed();
    } catch (error) {
        console.error('Error al seguir la página:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para cargar notificaciones
async function loadNotifications() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsBadge = document.getElementById('notificationsBadge');
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
        console.log("Notificaciones recibidas:", notifications);

        // Limpia las notificaciones
        notificationsDropdown.innerHTML = '<h3>Notificaciones</h3>';

        if (notifications.length === 0) {
            notificationsDropdown.innerHTML += '<p class="no-notifications">No tienes notificaciones</p>';
            if (notificationsBadge) notificationsBadge.style.display = 'none';
            return;
        }

        // Actualiza el badge de notificaciones
        if (notificationsBadge) {
            notificationsBadge.style.display = 'block';
            notificationsBadge.textContent = notifications.length;
        }

        // Mostrar notificaciones
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.classList.add('notification');

            // Comprobar que el usuario origen esté definido correctamente
            let fromUserName = 'Usuario';
            let fromUserId = '';

            if (notification.usuarioOrigen) {
                if (typeof notification.usuarioOrigen === 'object') {
                    fromUserName = notification.usuarioOrigen.nombre || 'Usuario';
                    fromUserId = notification.usuarioOrigen._id;
                } else if (typeof notification.usuarioOrigen === 'string') {
                    // Si solo se tiene el ID del usuario
                    fromUserId = notification.usuarioOrigen;
                    fromUserName = 'Usuario ' + fromUserId.substring(0, 5);
                }
            }

            // Mostrar botones de aceptar y rechazar solo para solicitudes de amistad
            let actionsHTML = '';
            if (notification.tipo === 'solicitud_amistad' && fromUserId) {
                actionsHTML = `
                    <div class="notification-actions">
                        <button class="accept-friend-btn" data-notification-id="${notification._id}" data-sender-id="${fromUserId}">Aceptar</button>
                        <button class="reject-friend-btn" data-notification-id="${notification._id}" data-sender-id="${fromUserId}">Rechazar</button>
                    </div>
                `;
            }

            notificationElement.innerHTML = `
                <p>${notification.contenido}</p>
                ${actionsHTML}
                <span class="notification-time">
                    ${new Date(notification.createdAt).toLocaleString()}
                </span>
            `;

            notificationsDropdown.appendChild(notificationElement);
        });

        // Agrega event listeners a los botones de aceptar y rechazar
        document.querySelectorAll('.accept-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                const senderId = button.getAttribute('data-sender-id');
                const notificationId = button.getAttribute('data-notification-id');
                acceptFriendRequest(senderId, notificationId);
            });
        });

        document.querySelectorAll('.reject-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                const senderId = button.getAttribute('data-sender-id');
                const notificationId = button.getAttribute('data-notification-id');
                rejectFriendRequest(senderId, notificationId);
            });
        });

    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        notificationsDropdown.innerHTML = `<h3>Notificaciones</h3><p class="error-message">Error: ${error.message}</p>`;
    }
}

async function acceptFriendRequest(senderId, notificationId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch('http://localhost:3000/api/users/accept-friend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ senderId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al aceptar la solicitud');
        }

        // Elimina la notificación específica del frontend
        removeNotificationFromUI(notificationId);

    } catch (error) {
        console.error('Error al aceptar la solicitud:', error);
        alert(`Error: ${error.message}`);
    }
}

async function rejectFriendRequest(senderId, notificationId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch('http://localhost:3000/api/users/reject-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ senderId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al rechazar la solicitud');
        }

        // Elimina la notificación específica del frontend
        removeNotificationFromUI(notificationId);

    } catch (error) {
        console.error('Error al rechazar la solicitud:', error);
        alert(`Error: ${error.message}`);
    }
}

function removeNotificationFromUI(notificationId) {
    const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationElement) {
        notificationElement.parentElement.remove(); // Elimina el contenedor de la notificación
    }

    // Si no hay más notificaciones, oculta el badge
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsBadge = document.getElementById('notificationsBadge');
    if (notificationsDropdown && notificationsDropdown.children.length <= 1) {
        notificationsDropdown.innerHTML += '<p class="no-notifications">No tienes notificaciones</p>';
        if (notificationsBadge) notificationsBadge.style.display = 'none';
    }
}

async function loadFriends() {
    const friendsListDiv = document.getElementById('friendsList');
    const accessToken = localStorage.getItem('accessToken');

    if (!friendsListDiv) return;

    try {
        // Obtiene la información del usuario autenticado
        const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const userData = await response.json();

        // Verifica si el usuario tiene amigos
        if (!userData.amigos || userData.amigos.length === 0) {
            friendsListDiv.innerHTML = '<p>No tienes amigos agregados.</p>';
            return;
        }

        // Limpiar y mostrar amigos
        friendsListDiv.innerHTML = '';
        userData.amigos.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.classList.add('friend');
            friendElement.innerHTML = `
                <img src="${friend.avatar || 'https://via.placeholder.com/40'}" alt="Avatar" class="friend-avatar">
                <span class="friend-name">${friend.nombre}</span>
                <button class="remove-friend-btn" data-friend-id="${friend._id}">Eliminar amigo</button>
                <button class="block-friend-btn" data-friend-id="${friend._id}">Bloquear usuario</button>
            `;
            friendsListDiv.appendChild(friendElement);
        });

        // Agrega event listeners a los botones de eliminar
        document.querySelectorAll('.remove-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                const friendId = button.getAttribute('data-friend-id');
                removeFriend(friendId);
            });
        });

        // Agrega event listeners a los botones de bloquear
        document.querySelectorAll('.block-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                const friendId = button.getAttribute('data-friend-id');
                blockUser(friendId);
            });
        });

    } catch (error) {
        console.error('Error al cargar amigos:', error);
        friendsListDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }
}

// Llama a la función loadFriends cuando la página se carga
window.onload = loadFriends;

async function removeFriend(friendId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        // Eliminar al amigo
        const removeResponse = await fetch('http://localhost:3000/api/users/remove-friend', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ friendId })
        });

        if (!removeResponse.ok) {
            const errorData = await removeResponse.json();
            throw new Error(errorData.message || 'Error al eliminar al amigo');
        }

        // Recarga la lista de amigos
        loadFriends();
        alert('Amigo eliminado correctamente.');
    } catch (error) {
        console.error('Error al eliminar al amigo:', error);
        alert(`Error: ${error.message}`);
    }
}

async function blockUser(friendId) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        // Primero, eliminar al amigo
        await removeFriend(friendId);

        // Luego, bloquear al usuario
        const blockResponse = await fetch('http://localhost:3000/api/users/block-user', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ blockedUserId: friendId })
        });

        if (!blockResponse.ok) {
            const errorData = await blockResponse.json();
            throw new Error(errorData.message || 'Error al bloquear al usuario');
        }

        // Recarga la lista de amigos
        loadFriends();
        alert('Usuario bloqueado y eliminado como amigo correctamente.');
    } catch (error) {
        console.error('Error al bloquear al usuario:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para buscar usuarios
async function searchUsers(query) {
    if (!query.trim()) return;

    const accessToken = localStorage.getItem('accessToken');
    const searchResultsDiv = document.getElementById('searchResultsContent');

    try {
        const response = await fetch(`http://localhost:3000/api/users/search-friends?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al buscar usuarios');
        }

        const users = await response.json();

        // Limpia y muestra resultados
        searchResultsDiv.innerHTML = '';

        if (users.length === 0) {
            searchResultsDiv.innerHTML = '<p>No se encontraron usuarios</p>';
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
            searchResultsDiv.appendChild(userElement);
        });

        // Muestra el contenedor de resultados
        document.getElementById('searchResults').style.display = 'block';

        // Agrega event listeners a los botones de agregar amigo
        document.querySelectorAll('.add-friend-btn').forEach(button => {
            button.addEventListener('click', () => {
                addFriend(button.getAttribute('data-user-id'));
            });
        });

    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        searchResultsDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }
}

// Función para cerrar los resultados de búsqueda
function closeSearchResults() {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.style.display = 'none';
}

// Agrega event listener al botón de cierre
document.getElementById('closeSearchResults').addEventListener('click', closeSearchResults);

// Event listener para el botón de búsqueda
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    searchUsers(query);
});

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

        // Recarga el feed para mostrar el cambio
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

        // Recarga el feed para mostrar el comentario
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

        await fetch('http://localhost:3000/api/notifications/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipo: "solicitud_amistad",
                usuarioDestino: friendId,
                usuarioOrigen: localStorage.getItem('userId'),
                contenido: "Tienes una nueva solicitud de amistad."
            })
        });

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

// Cerrar dropdown de notificaciones cuando se hace clic afuera
window.addEventListener('click', (event) => {
    const dropdown = document.getElementById('notificationsDropdown');
    const button = document.getElementById('notificationsButton');

    if (dropdown && button && dropdown.classList.contains('show') &&
        !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Perfil 
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el botón de perfil
    const profileButton = document.getElementById('profileButton');

    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
});