const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors()); // Permite que el frontend hable con este backend
app.use(express.json()); // Permite al servidor entender JSON
app.use(express.static('public')); // Sirve los archivos de la carpeta 'public' (tu frontend)

// Railway te dará un puerto, sino usa el 3000
const PORT = process.env.PORT || 3000; 

// --- INICIO DE ENDPOINTS CRUD ---

// 1. CREATE (Agregar registro)
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    // Código P2002 es "Violación de restricción única" (email repetido)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email ya existe.' });
    }
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

// 2. READ (Consultar TODOS los registros)
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' } // Ordenar por más nuevo
  });
  res.json(users);
});

// 3. READ (Consultar registro INDIVIDUAL)
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
});

// 4. UPDATE (Editar registro)
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
      },
    });
    res.json(updatedUser);
  } catch (error) {
     // Código P2002 (email repetido) o P2025 (registro no encontrado)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email ya está en uso por otro usuario.' });
    } else if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

// 5. DELETE (Eliminar registro)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // 204 = No Content (éxito, pero no devuelve nada)
  } catch (error) {
    // Código P2025 (registro no encontrado)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

// --- FIN DE ENDPOINTS ---

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});