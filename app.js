import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://brqahjawsfspgpstwzwy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWFoamF3c2ZzcGdwc3R3end5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Njk5OTIsImV4cCI6MjA2MzI0NTk5Mn0.lyHzPFglOdwQWerw8eoNJgBWaXg-VUxa5tfmw-cjW7U';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const formularioTarea = document.getElementById('formularioTarea');
const listaTareas = document.getElementById('listaTareas');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

async function cargarCategorias(supabase) {
  const selectCategoria = document.getElementById('categoria');
  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*');

  if (error) {
    console.error('Error al cargar categorías:', error.message);
    return;
  }

  selectCategoria.innerHTML = '<option value="">-- Seleccione una categoría --</option>';
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.id;
    option.textContent = categoria.nombre;
    selectCategoria.appendChild(option);
  });
}

async function cargarTareas(supabase) {
  const { data: tareas, error } = await supabase
    .from('tareas')
    .select('*, categorias(nombre)');

  if (error) {
    console.error('Error al cargar tareas:', error.message);
    return;
  }

  listaTareas.innerHTML = '';

  tareas.forEach(tarea => {
    const contenedor = document.createElement('div');
    contenedor.style.border = '1px solid #ccc';
    contenedor.style.margin = '10px';
    contenedor.style.padding = '10px';

    const pTitulo = document.createElement('p');
    pTitulo.textContent = `Título: ${tarea.titulo}`;

    const pDescripcion = document.createElement('p');
    pDescripcion.textContent = `Descripción: ${tarea.descripcion}`;

    const pFechaHora = document.createElement('p');
    pFechaHora.textContent = `Fecha y hora: ${tarea.fecha || ''} ${tarea.hora || ''}`;

    const pPrioridad = document.createElement('p');
    pPrioridad.textContent = `Prioridad: ${tarea.prioridad}`;

    const pCompletada = document.createElement('p');
    pCompletada.textContent = `Completada: ${tarea.completada ? 'Sí' : 'No'}`;

    const pCategoria = document.createElement('p');
    pCategoria.textContent = `Categoría: ${tarea.categorias ? tarea.categorias.nombre : 'Sin categoría'}`;

    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => {
      formularioTarea.idTarea.value = tarea.id;
      formularioTarea.titulo.value = tarea.titulo;
      formularioTarea.descripcion.value = tarea.descripcion;
      formularioTarea.fecha.value = tarea.fecha || '';
      formularioTarea.hora.value = tarea.hora || '';
      formularioTarea.prioridad.value = tarea.prioridad;
      formularioTarea.completada.checked = tarea.completada;
      formularioTarea.categoria.value = tarea.categoria_id || '';

      btnGuardar.textContent = 'Actualizar';
      btnCancelar.style.display = 'inline';
      formularioTarea.scrollIntoView({ behavior: 'smooth' });
    });

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.addEventListener('click', async () => {
      if (confirm('¿Seguro que quieres eliminar esta tarea?')) {
        const { error } = await supabase
          .from('tareas')
          .delete()
          .eq('id', tarea.id);

        if (error) {
          console.error('Error al eliminar tarea:', error.message);
        } else {
          await cargarTareas(supabaseClient);
        }
      }
    });

    contenedor.appendChild(pTitulo);
    contenedor.appendChild(pDescripcion);
    contenedor.appendChild(pFechaHora);
    contenedor.appendChild(pPrioridad);
    contenedor.appendChild(pCompletada);
    contenedor.appendChild(pCategoria);
    contenedor.appendChild(botonEditar);
    contenedor.appendChild(botonEliminar);
    listaTareas.appendChild(contenedor);
  });
}

formularioTarea.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nuevaTarea = {
    titulo: formularioTarea.titulo.value,
    descripcion: formularioTarea.descripcion.value,
    fecha: formularioTarea.fecha.value,
    hora: formularioTarea.hora.value,
    prioridad: parseInt(formularioTarea.prioridad.value),
    completada: formularioTarea.completada.checked,
    categoria_id: formularioTarea.categoria.value || null,
  };

  if (formularioTarea.idTarea.value) {
    const { error } = await supabaseClient
      .from('tareas')
      .update(nuevaTarea)
      .eq('id', formularioTarea.idTarea.value);

    if (error) {
      console.error('Error al actualizar tarea:', error.message);
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from('tareas')
      .insert([nuevaTarea]);

    if (error) {
      console.error('Error al insertar tarea:', error.message);
      return;
    }
  }

  formularioTarea.reset();
  formularioTarea.idTarea.value = '';
  btnGuardar.textContent = 'Guardar';
  btnCancelar.style.display = 'none';
  await cargarTareas(supabaseClient);
});

btnCancelar.addEventListener('click', () => {
  formularioTarea.reset();
  formularioTarea.idTarea.value = '';
  btnGuardar.textContent = 'Guardar';
  btnCancelar.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', async () => {
  await cargarTareas(supabaseClient);
  await cargarCategorias(supabaseClient);
});