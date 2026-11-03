
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formComprobante');
    const btnGuardar = document.getElementById('btnGuardar');
    const modal = document.getElementById('modal');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalBody = document.getElementById('modalBody');
    const cerrarModal = document.getElementById('cerrarModal');
    const tabla = document.querySelector('table');

    const notificar = async (icon, title, text) => {
        return Swal.fire({
            icon,
            title,
            text,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563eb',
            allowOutsideClick: false
        });
    };

    const mostrarModal = (titulo) => {
        modalTitulo.textContent = titulo;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    };

    const ocultarModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modalBody.replaceChildren();
    };

    cerrarModal.addEventListener('click', ocultarModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            ocultarModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            ocultarModal();
        }
    });

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();

        const archivo = document.getElementById('imagen').files[0];

        if (!archivo) {
            await notificar('warning', 'Imagen requerida', 'Selecciona una imagen del comprobante.');
            return;
        }

        if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
            await notificar('warning', 'Formato no permitido', 'Solo se permiten imágenes JPG y PNG.');
            return;
        }

        if (archivo.size > 5 * 1024 * 1024) {
            await notificar('warning', 'Archivo demasiado grande', 'La imagen no debe superar los 5 MB.');
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Procesando comprobante...';

        try {
            const datos = new FormData(formulario);

            const respuesta = await fetch('/comprobantes', {
                method: 'POST',
                body: datos
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.mensaje || 'No se pudo registrar el comprobante.');
            }

            await notificar('success', '¡Registro exitoso!', resultado.mensaje);
            window.location.reload();
        } catch (error) {
            await notificar('error', 'Error al registrar', error.message);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Registrar comprobante';
        }
    });

    tabla.addEventListener('click', async (event) => {
        const boton = event.target.closest('button[data-action]');

        if (!boton || boton.disabled) return;

        const id = boton.dataset.id;
        const accion = boton.dataset.action;
        const url = `/comprobantes/${encodeURIComponent(id)}`;

        if (accion === 'imagen') {
            modalBody.replaceChildren();

            const imagen = document.createElement('img');
            imagen.src = `${url}/imagen`;
            imagen.alt = 'Imagen del comprobante';

            imagen.onerror = () => {
                modalBody.textContent = 'No se pudo cargar la imagen.';
            };

            modalBody.appendChild(imagen);
            mostrarModal('Vista previa del comprobante');
        }

        if (accion === 'json') {
            boton.disabled = true;

            try {
                const respuesta = await fetch(`${url}/json`);

                if (!respuesta.ok) {
                    throw new Error('No se pudo obtener el JSON.');
                }

                const resultado = await respuesta.json();

                const pre = document.createElement('pre');
                pre.textContent = JSON.stringify(resultado, null, 4);

                modalBody.replaceChildren(pre);
                mostrarModal('Resultado JSON de Textract');
            } catch (error) {
                await notificar('error', 'Error al consultar JSON', error.message);
            } finally {
                boton.disabled = false;
            }
        }

        if (accion === 'eliminar') {
            const confirmacion = await Swal.fire({
                icon: 'warning',
                title: '¿Eliminar comprobante?',
                text: 'Se eliminará el registro y su imagen almacenada.',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#64748b',
                reverseButtons: true
            });

            if (!confirmacion.isConfirmed) return;

            boton.disabled = true;

            try {
                const respuesta = await fetch(url, {
                    method: 'DELETE'
                });

                const resultado = await respuesta.json();

                if (!respuesta.ok || !resultado.success) {
                    throw new Error(resultado.mensaje || 'No se pudo eliminar el comprobante.');
                }

                await notificar('success', '¡Eliminación exitosa!', resultado.mensaje);
                window.location.reload();
            } catch (error) {
                await notificar('error', 'Error al eliminar', error.message);
                boton.disabled = false;
            }
        }
    });
});
