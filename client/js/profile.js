document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const userData = await response.json();
        console.log("Perfil obtenido:", userData);

        // Actualiza los elementos del DOM con la información del usuario
        document.getElementById("nombre").textContent = userData.nombre || "";
        document.getElementById("biografia").textContent = userData.biografia || "";
        document.getElementById("avatar").src = `../avatars/${userData.avatar}`;

        // Guarda el ID del usuario para futuras acciones
        localStorage.setItem("userId", userData._id);
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        alert("Error al cargar el perfil. Por favor, intenta de nuevo más tarde.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();

    // Agrega manejadores de eventos a los avatares
    document.querySelectorAll('.avatar').forEach(img => {
        img.addEventListener('click', selectAvatar);
    });
});

// Función para seleccionar un avatar
function selectAvatar(e) {
    // Quitar la clase selected de todos los avatares
    document.querySelectorAll('.avatar').forEach(avatar =>
        avatar.classList.remove('selected'));

    // Añadir la clase selected al avatar clickeado
    e.target.classList.add('selected');

    // Actualizar el valor del campo oculto
    document.getElementById('editAvatar').value = e.target.dataset.avatar;
}

function openEditModal() {
    // Obtiene los valores actuales para mostrarlos en el modal
    document.getElementById("editNombre").value = document.getElementById("nombre").textContent;
    document.getElementById("editBiografia").value = document.getElementById("biografia").textContent;

    // Obtiene el nombre de archivo actual del avatar
    const avatarSrc = document.getElementById("avatar").src;
    const avatarFilename = avatarSrc.split('/').pop();
    document.getElementById("editAvatar").value = avatarFilename;

    // Marca el avatar actual como seleccionado
    document.querySelectorAll('.avatar').forEach(img => {
        if (img.dataset.avatar === avatarFilename) {
            img.classList.add('selected');
        } else {
            img.classList.remove('selected');
        }
    });

    // Mostrar el modal
    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

async function saveProfile() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "login.html";
        return;
    }

    const nombre = document.getElementById("editNombre").value;
    const biografia = document.getElementById("editBiografia").value;
    const avatar = document.getElementById("editAvatar").value;

    try {
        const response = await fetch("http://localhost:3000/api/users/edit-profile", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, biografia, avatar })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        alert("Perfil actualizado correctamente.");
        closeEditModal();
        loadProfile(); // Recarga los datos
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alert("Error al actualizar el perfil. Por favor, intenta de nuevo.");
    }
}

async function deleteAccount() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/users/delete-profile", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        alert("Cuenta eliminada correctamente.");
        logout();
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        window.location.href = "login.html";
    }
}

// Función para cancelar y redirigir a feed.html
function cancel() {
    window.location.href = "feed.html";
}