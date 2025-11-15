document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const userList = document.getElementById('user-list');
  const userIdField = document.getElementById('user-id');
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const btnClear = document.getElementById('btn-clear');

  // La URL base de tu API.
  // Para pruebas locales, usaremos http://localhost:3000
  // Cuando se suba a Railway, '/api/users' será suficiente.
  const API_URL = '/api/users';

  // --- FUNCIÓN 2: Consultar TODOS los registros ---
  async function fetchUsers() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar la red');
      const users = await response.json();
      
      userList.innerHTML = ''; // Limpiar la lista actual

      if (users.length === 0) {
        userList.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
      }

      users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
          <div class="user-info">
            <span>${user.name} (ID: ${user.id})</span>
            <span>${user.email}</span>
          </div>
          <div class="user-actions">
            <button class="btn-edit" data-id="${user.id}" data-name="${user.name}" data-email="${user.email}">Editar</button>
            <button class="btn-delete" data-id="${user.id}">Eliminar</button>
          </div>
        `;
        userList.appendChild(userItem);
      });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      userList.innerHTML = '<p>Error al cargar usuarios.</p>';
    }
  }

  // --- FUNCIÓN 1 (Crear) y 4 (Editar) ---
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que la página se recargue

    const id = userIdField.value;
    const name = nameField.value;
    const email = emailField.value;

    if (!name || !email) {
      alert('Nombre y Email son obligatorios');
      return;
    }

    const userData = { name, email };

    try {
      let response;
      let url = API_URL;
      let method = 'POST';

      if (id) {
        // --- 4. UPDATE (Editar) ---
        url = `${API_URL}/${id}`;
        method = 'PUT';
      }

      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error');
      }

      clearForm();
      fetchUsers(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(`Error al guardar: ${error.message}`);
    }
  });

  // --- Funciones 3 (Individual) y 5 (Eliminar) ---
  userList.addEventListener('click', async (e) => {
    
    // --- 3. Consultar INDIVIDUAL (para Editar) ---
    // (Simulamos la consulta individual llenando el form)
    if (e.target.classList.contains('btn-edit')) {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      const email = e.target.dataset.email;

      // Llenamos el formulario con los datos del usuario
      userIdField.value = id;
      nameField.value = name;
      emailField.value = email;
      window.scrollTo(0, 0); // Subir al inicio de la página
    }

    // --- 5. DELETE (Eliminar) ---
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      
      if (confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${id}?`)) {
        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar');
          }

          fetchUsers(); // Recargar la lista
        } catch (error) {
          console.error('Error al eliminar:', error);
          alert(`Error al eliminar: ${error.message}`);
        }
      }
    }
  });

  // Limpiar formulario
  function clearForm() {
    userIdField.value = '';
    nameField.value = '';
    emailField.value = '';
  }
  
  btnClear.addEventListener('click', clearForm);

  // Carga inicial de usuarios al abrir la página
  fetchUsers();
});
