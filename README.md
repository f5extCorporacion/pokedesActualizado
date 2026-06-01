# 🎮 Qwik Pokédex App

¡Bienvenido a la Pokédex interactiva! Una aplicación web ultra rápida construida con **Qwik City**, diseñada para explorar tus Pokémon favoritos con un rendimiento óptimo, diseño responsive y características dinámicas.

## 🚀 Características

* **Carga Instantánea:** Optimizado con la tecnología de hidratación cero de Qwik.
* **Buscador en Tiempo Real:** Filtra tus Pokémon por nombre al instante.
* **Diseño Interactivo & Modal:** Explora detalles avanzados (estadísticas, tipos, habilidades y movimientos).
* **Soporte de Temas:** Cambia entre tema *Cupcake* (claro) y *Retro* (oscuro) con persistencia en LocalStorage (oculto en móvil para mejorar la interfaz).
* **Tour Guiado:** Sistema de bienvenida interactivo utilizando `driver.js`.
* **Paginación Eficiente:** Navegación fluida de 100 Pokémon por página mediante `routeLoader$`.

---

## 📁 Estructura del Proyecto

Este proyecto utiliza el enrutamiento basado en directorios de **QwikCity**:

```text
├── public/          # Archivos estáticos (imágenes, iconos, etc.)
└── src/
    ├── components/  # Componentes reutilizables de la app
    └── routes/      # Páginas y rutas de la aplicación (index.tsx principal)
