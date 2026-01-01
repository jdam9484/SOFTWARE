// Contáctanos.js
// Guarda los mensajes del formulario de contacto en Firestore para que el admin los vea

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form-contacto');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        if (!nombre || !email || !mensaje) return;
        try {
            await firebase.firestore().collection('contacto').add({
                nombre,
                email,
                mensaje,
                fecha: new Date().toISOString()
            });
            form.reset();
            alert('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
        } catch (err) {
            alert('Error al enviar el mensaje. Intenta nuevamente.');
        }
    });
});
