// Middleware global de manejo de errores
// Recibe 4 parámetros para que Express lo identifique como manejador de errores
const errorHandler = (err, req, res, next) => {
  // Registramos el stack trace detallado en consola para debugging interno
  console.error('🔥 Error no controlado:', err.stack);

  // Respondemos al cliente con un código 500 estándar y mensaje seguro
  return res.status(500).json({ 
    error: 'Error interno del servidor' 
  });
};

module.exports = errorHandler;
