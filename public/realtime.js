const socket = io();

socket.on('serialData', function(data) {
    if (data.trim() === '0') {
        document.getElementById('box1').style.backgroundColor = 'green';
    } else {
        document.getElementById('box1').style.backgroundColor = 'red';
    }
});

// Función para cargar los usuarios
function loadUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.userType}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        });
}

// Función para eliminar un usuario
function deleteUser(id) {
    fetch(`/users/${id}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                loadUsers();
            } else {
                alert('Error al eliminar el usuario');
            }
        });
}

// Función para agregar un usuario
document.getElementById('addUserBtn').addEventListener('click', () => {
    const name = prompt('Ingrese el nombre del usuario:');
    const password = prompt('Ingrese la contraseña del usuario:');
    const userType = prompt('Ingrese el tipo de usuario (0 o 1):');
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, userType })
    }).then(response => {
        if (response.ok) {
            loadUsers();
        } else {
            alert('Error al agregar el usuario');
        }
    });
});

// Cargar los usuarios al cargar la página
loadUsers();
