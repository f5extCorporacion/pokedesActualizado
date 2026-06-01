/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/routes/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "cupcake",
      "retro", 
      "forest"
    ], // true: todos los temas, false: solo light/dark, array: temas específicos
    darkTheme: "forest", // nombre del tema oscuro por defecto
    base: true, // aplica colores base
    styled: true, // aplica estilos
    utils: true, // aplica utilidades
    logs: false, // muestra logs en consola
  },
}