import { component$, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  useLocation,
  type DocumentHead,
} from "@builder.io/qwik-city";
import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();

export const usePokemon = routeLoader$(async ({ query }) => {
  const page = Number(query.get("page") || 1);
  const limit = 100;
  const offset = (page - 1) * limit;

  const list = await P.getPokemonsList({
    limit,
    offset,
  });

  const pokemons = await Promise.all(
    list.results.map((pokemon) =>
      P.getPokemonByName(pokemon.name)
    )
  );

  return {
    page,
    total: list.count,
    pokemons,
  };
});

export default component$(() => {
  const data = usePokemon();
  const navigation = useLocation();
  const selectedPokemon = useSignal<any>(null);
  const searchTerm = useSignal("");
  const theme = useSignal("cupcake");
  const driverObj = useSignal<any>(null);
  const isLoading = useSignal(true);
  const isMenuOpen = useSignal(false);

  // Simular carga inicial
  useVisibleTask$(() => {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  });

  // Inicializar driver.js solo en el cliente
  useVisibleTask$(async () => {
    const { driver } = await import("driver.js");
    await import("driver.js/dist/driver.css");
    
    driverObj.value = driver();
  });

  // Función para iniciar el tour
  const startTour = $(() => {
    if (!driverObj.value) return;
    
    driverObj.value.setSteps([
      {
        element: '#title-pokedex',
        popover: {
          title: '🎮 Bienvenido a la Pokédex',
          description: 'Aquí podrás explorar todos los Pokémon, ver sus estadísticas y mucho más.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#search-input',
        popover: {
          title: '🔍 Buscador de Pokémon',
          description: 'Escribe el nombre de cualquier Pokémon para filtrar la lista rápidamente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#theme-toggle',
        popover: {
          title: '🎨 Cambiar Tema',
          description: 'Alterna entre el tema Cupcake (claro) y Retro (oscuro) para personalizar la apariencia.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-button',
        popover: {
          title: '📢 Tour Guiado',
          description: 'Puedes volver a iniciar este tour en cualquier momento haciendo clic aquí.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '.pokemon-grid',
        popover: {
          title: '📋 Lista de Pokémon',
          description: 'Todos los Pokémon se muestran aquí. Haz clic en cualquier imagen o botón "Ver detalles" para más información.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.pagination-buttons',
        popover: {
          title: '📄 Paginación',
          description: 'Navega entre las páginas para ver más Pokémon. Hay 100 Pokémon por página.',
          side: 'top',
          align: 'center'
        }
      }
    ]);

    driverObj.value.drive();
  });

  // Cargar tema guardado
  useVisibleTask$(() => {
    const savedTheme = localStorage.getItem("pokemon-theme");
    if (savedTheme && (savedTheme === "cupcake" || savedTheme === "retro")) {
      theme.value = savedTheme;
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  });

  const openModal = $((pokemon: any) => {
    selectedPokemon.value = pokemon;
    (
      document.getElementById(
        "pokemon_modal"
      ) as HTMLDialogElement
    )?.showModal();
  });

  const closeModal = $(() => {
    const modal = document.getElementById("pokemon_modal") as HTMLDialogElement;
    modal?.close();
    selectedPokemon.value = null;
  });

  const toggleTheme = $(() => {
    const newTheme = theme.value === "cupcake" ? "retro" : "cupcake";
    theme.value = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("pokemon-theme", newTheme);
  });

  // Filtrar Pokémon por nombre
  const filteredPokemons = () => {
    if (!searchTerm.value) return data.value.pokemons;
    return data.value.pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  };

  // Mostrar loader si está cargando inicialmente o navegando
  if (isLoading.value || navigation.isNavigating) {
    return (
      <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100">
        <div class="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl bg-base-200 shadow-xl mx-4">
          {/* Pokébola animada */}
          <div class="relative w-20 h-20 sm:w-24 sm:h-24">
            <div class="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin">
              <div class="absolute top-0 left-0 w-full h-1/2 bg-red-500 rounded-t-full"></div>
              <div class="absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full"></div>
              <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-800"></div>
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white border-4 border-gray-800 rounded-full z-10"></div>
            </div>
          </div>
          <div class="flex flex-col items-center gap-2">
            <p class="text-lg sm:text-xl font-bold text-neutral animate-pulse text-center">
              Cargando Pokémon...
            </p>
            <div class="flex gap-1">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-200">
      {/* Header responsive */}
      <div class="sticky top-0 z-20 bg-base-100 shadow-lg">
        <div class="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Header mobile - layout optimizado */}
          <div class="flex flex-col gap-3 sm:gap-4">
            {/* Fila 1: Título y botones */}
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 sm:gap-3 flex-1">
                <h1 id="title-pokedex" class="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Pokédex
                </h1>
                <button
                  id="tour-button"
                  class="btn btn-ghost btn-xs sm:btn-sm gap-0.5 sm:gap-1"
                  onClick$={startTour}
                  title="Tour guiado"
                >
                  <span class="text-sm sm:text-base">🎮 Tour</span>
                  <span class="hidden xs:inline text-xs sm:text-sm">Tour</span>
                </button>
              </div>
              
              {/* Switch de tema - visible siempre */}
              <div id="theme-toggle" class="flex items-center gap-1 sm:gap-2">
                <span class="text-xs sm:text-sm">🌸</span>
                <input
                  type="checkbox"
                  class="toggle toggle-primary toggle-sm sm:toggle-md"
                  checked={theme.value === "retro"}
                  onChange$={toggleTheme}
                />
                <span class="text-xs sm:text-sm">🕰️</span>
              </div>
            </div>
            
            {/* Fila 2: Buscador - ancho completo en mobile */}
            <div class="w-full">
              <input
                id="search-input"
                type="text"
                placeholder="🔍 Buscar Pokémon..."
                class="input input-bordered w-full input-sm sm:input-md"
                value={searchTerm.value}
                onInput$={(e: any) => searchTerm.value = e.target.value}
              />
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Contador de resultados */}
        <div class="text-center mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
          Mostrando {filteredPokemons().length} de {data.value.pokemons.length} Pokémon
        </div>

        {/* Grid responsive - adaptado para móvil */}
        <div class="pokemon-grid grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {filteredPokemons().map((pokemon) => (
            <div
              key={pokemon.id}
              class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div class="card-body items-center text-center p-2 sm:p-3 md:p-4">
                <img
                  src={pokemon.sprites.front_default ?? ""}
                  alt={pokemon.name}
                  class="w-16 h-16 sm:w-20 sm:h-20 md:w-[100px] md:h-[100px] rounded-full bg-base-200 transition-all duration-300 hover:scale-110 cursor-pointer"
                  onClick$={() => openModal(pokemon)}
                />
                <h2 class="font-bold capitalize text-sm sm:text-base mt-1 sm:mt-2 truncate w-full">
                  {pokemon.name}
                </h2>
                <button
                  class="btn btn-primary btn-xs sm:btn-sm mt-2 sm:mt-3"
                  onClick$={() => openModal(pokemon)}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredPokemons().length === 0 && (
          <div class="text-center py-8 sm:py-12">
            <p class="text-xl sm:text-2xl text-gray-500">No se encontraron Pokémon</p>
            <button
              class="btn btn-primary mt-4 btn-sm sm:btn-md"
              onClick$={() => searchTerm.value = ""}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Paginación responsive */}
        <div class="pagination-buttons flex justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 pb-6 sm:pb-8">
          {data.value.page > 1 && (
            <a
              class="btn btn-sm sm:btn-md"
              href={`/?page=${data.value.page - 1}`}
            >
              ← Anterior
            </a>
          )}

          <a
            class="btn btn-primary btn-sm sm:btn-md"
            href={`/?page=${data.value.page + 1}`}
          >
            Siguiente →
          </a>
        </div>
      </div>

      {/* Modal - Mejorado para mobile y cierre al hacer clic fuera */}
      <dialog
        id="pokemon_modal"
        class="modal modal-bottom sm:modal-middle"
        onClick$={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div class="modal-box w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-0 sm:p-0">
          {selectedPokemon.value && (
            <>
              {/* Header del modal - responsive */}
              <div class="sticky top-0 bg-primary text-primary-content p-3 sm:p-4 flex justify-between items-center z-10">
                <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <img
                    src={selectedPokemon.value.sprites.front_default ?? ""}
                    alt={selectedPokemon.value.name}
                    class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 p-1 flex-shrink-0"
                  />
                  <h3 class="text-lg sm:text-xl md:text-2xl font-bold capitalize truncate">
                    {selectedPokemon.value.name}
                  </h3>
                </div>
                <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div class="badge badge-secondary text-xs sm:text-sm md:text-lg">
                    #{selectedPokemon.value.id}
                  </div>
                  <button
                    class="btn btn-circle btn-ghost btn-xs sm:btn-sm"
                    onClick$={closeModal}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div class="p-3 sm:p-4 md:p-6">
                {/* Grid - 1 columna en mobile, 2 en desktop */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Columna izquierda */}
                  <div class="space-y-3 sm:space-y-4">
                    {/* Imagen */}
                    <div class="flex justify-center">
                      <img
                        src={
                          selectedPokemon.value.sprites
                            .other["official-artwork"]
                            .front_default ??
                          selectedPokemon.value.sprites
                            .front_default
                        }
                        alt={selectedPokemon.value.name}
                        class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain transition-all duration-300 hover:scale-110 cursor-pointer"
                      />
                    </div>

                    {/* Datos básicos - grid 2 columnas */}
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                      <div class="bg-base-200 p-2 rounded-lg">
                        <p class="text-[10px] sm:text-xs text-gray-500">Altura</p>
                        <p class="font-bold text-sm sm:text-base">{selectedPokemon.value.height / 10}m</p>
                      </div>
                      <div class="bg-base-200 p-2 rounded-lg">
                        <p class="text-[10px] sm:text-xs text-gray-500">Peso</p>
                        <p class="font-bold text-sm sm:text-base">{selectedPokemon.value.weight / 10}kg</p>
                      </div>
                      <div class="bg-base-200 p-2 rounded-lg col-span-2">
                        <p class="text-[10px] sm:text-xs text-gray-500">Experiencia base</p>
                        <p class="font-bold text-sm sm:text-base">{selectedPokemon.value.base_experience}</p>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div class="space-y-3 sm:space-y-4">
                    {/* Tipos */}
                    <div class="bg-base-200 p-3 sm:p-4 rounded-lg">
                      <h4 class="font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span class="text-base sm:text-lg">⚡</span> Tipos
                      </h4>
                      <div class="flex gap-1 sm:gap-2 flex-wrap">
                        {selectedPokemon.value.types.map(
                          (type: any) => (
                            <span
                              key={type.type.name}
                              class="badge badge-primary badge-sm sm:badge-md"
                            >
                              {type.type.name}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Habilidades */}
                    <div class="bg-base-200 p-3 sm:p-4 rounded-lg">
                      <h4 class="font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span class="text-base sm:text-lg">✨</span> Habilidades
                      </h4>
                      <div class="flex flex-wrap gap-1 sm:gap-2">
                        {selectedPokemon.value.abilities.map(
                          (ability: any) => (
                            <span
                              key={ability.ability.name}
                              class="badge badge-outline badge-sm sm:badge-md"
                            >
                              {ability.ability.name}
                              {ability.is_hidden && " 🔒"}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div class="mt-4 sm:mt-6">
                  <h4 class="font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span class="text-base sm:text-lg">📊</span> Estadísticas
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {selectedPokemon.value.stats.map(
                      (stat: any) => (
                        <div key={stat.stat.name} class="bg-base-200 p-2 rounded-lg">
                          <div class="flex justify-between text-xs sm:text-sm mb-1">
                            <span class="capitalize font-semibold">
                              {stat.stat.name}
                            </span>
                            <span class="font-bold">
                              {stat.base_stat}
                            </span>
                          </div>
                          <progress
                            class="progress progress-primary w-full h-1.5 sm:h-2"
                            value={stat.base_stat}
                            max="255"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Movimientos */}
                <div class="mt-4 sm:mt-6">
                  <h4 class="font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span class="text-base sm:text-lg">🎯</span> Movimientos
                    <span class="text-[10px] sm:text-xs text-gray-500">
                      ({selectedPokemon.value.moves.length} total)
                    </span>
                  </h4>
                  <div class="max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto bg-base-200 rounded-lg p-2 sm:p-3">
                    <div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                      {selectedPokemon.value.moves.map(
                        (move: any) => (
                          <span
                            key={move.move.name}
                            class="badge badge-accent badge-xs sm:badge-sm justify-center text-[10px] sm:text-xs"
                          >
                            {move.move.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Pokédex",
  meta: [
    {
      name: "description",
      content: "Pokédex creada con Qwik - Responsive",
    },
  ],
};