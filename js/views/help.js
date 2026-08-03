async function renderHelp(main) {
  main.innerHTML = `
    <div class="section-header">
      <div class="section-title"><i class="fa-solid fa-circle-question"></i> Ayuda y Cómo usar</div>
    </div>

    <div class="card" style="margin-bottom:1rem">
      <h4><i class="fa-solid fa-book-open"></i> ¿Qué es Podium?</h4>
      <p style="margin-top:0.5rem">
        Podium es un gestor de ligas eSports y deportes que funciona <strong>100% en tu dispositivo</strong>, sin servidor ni conexión.
        Tus ligas, equipos, jugadores y partidos se guardan localmente en el navegador (IndexedDB). Por eso también puedes usarlo offline.
      </p>
    </div>

    <div class="card" style="margin-bottom:1rem">
      <h4><i class="fa-solid fa-shoe-prints"></i> Primeros pasos</h4>
      <ol style="margin:0.5rem 0 0 1.25rem;display:flex;flex-direction:column;gap:0.5rem">
        <li><strong>Crea una liga</strong> en la pestaña <em>Ligas</em>. Elige un eSport (Valorant, Fighting Games, League of Legends) o un <strong>Formato personalizado</strong> para crear el tuyo (voleibol, fútbol, etc.).</li>
        <li><strong>Agrega equipos</strong> en la pestaña <em>Equipos</em> con el botón "+ Nuevo equipo".</li>
        <li><strong>Agrega jugadores</strong> a cada equipo en la pestaña <em>Jugadores</em>.</li>
        <li><strong>Genera el calendario</strong>: la liga crea automáticamente el fixture (todos contra todos) o el bracket (eliminación directa).</li>
        <li><strong>Programa y finaliza partidos</strong> desde <em>Partidos</em>: carga el marcador y registra los eventos de cada jugador.</li>
        <li><strong>Consulta resultados</strong> en <em>Dashboard</em> y <em>Stats</em>: tabla de posiciones, ranking de anotadores y gráficos.</li>
      </ol>
    </div>

    <div class="card">
      <h4><i class="fa-solid fa-circle-question"></i> Preguntas frecuentes</h4>
      <div style="margin-top:0.75rem">
        <details class="faq-item">
          <summary>¿Dónde se guardan mis datos?</summary>
          <div class="faq-body">Todo se guarda localmente en el navegador (IndexedDB). Nada sale de tu dispositivo. Te recomendamos <strong>exportar</strong> tus ligas de vez en cuando como respaldo, ya que borrar los datos del navegador elimina tu información.</div>
        </details>

        <details class="faq-item">
          <summary>¿Puedo crear un formato deportivo propio?</summary>
          <div class="faq-body">Sí. Al crear una liga, elige <strong>"Formato personalizado"</strong> y configura: nombre, icono, color, estructura de marcador (simple, mejor de N sets o automático por eventos), puntos por victoria/empate/derrota y los términos que quieras usar (equipo, jugador, evento, cancha, etc.).</div>
        </details>

        <details class="faq-item">
          <summary>¿Cómo funciona el marcador "Mejor de N sets"?</summary>
          <div class="faq-body">Ideal para voleibol o tenis. Define cuántos sets se necesitan para ganar (por defecto 3 de 5). El partido valida que el ganador llegue exactamente a esa cifra.</div>
        </details>

        <details class="faq-item">
          <summary>¿Puede haber empates?</summary>
          <div class="faq-body">En modalidad <strong>Liga</strong> sí: puedes asignar puntos por empate al crear el formato. En <strong>Eliminación directa</strong> no se permiten empates, siempre hay un ganador.</div>
        </details>

        <details class="faq-item">
          <summary>¿Cómo deshago un partido ya finalizado?</summary>
          <div class="faq-body">Abre el partido en <em>Partidos</em> y usa el botón <strong>Deshacer</strong>. Esto revierte el marcador, los puntos y las estadísticas. En brackets, primero debes deshacer los partidos posteriores de la ronda.</div>
        </details>

        <details class="faq-item">
          <summary>¿Cómo exporto o importo una liga?</summary>
          <div class="faq-body">Desde la pantalla <em>Ligas</em>, usa el botón <strong>Exportar</strong> en la tarjeta de la liga para descargarla como archivo JSON. Para restaurarla, pulsa <strong>Importar liga</strong>.</div>
        </details>

        <details class="faq-item">
          <summary>¿Cómo cambio la liga activa?</summary>
          <div class="faq-body">Entra en <em>Ligas</em> y haz clic en la liga que quieras usar. La que está marcada como <strong>ACTIVA</strong> es la que se muestra en el resto de pestañas.</div>
        </details>

        <details class="faq-item">
          <summary>¿Qué es la eliminación directa con doble eliminación?</summary>
          <div class="faq-body">Los equipos que pierden en el winners bracket caen a un <strong>losers bracket</strong> y aún pueden llegar a la Gran Final. Solo se eliminan al perder dos veces.</div>
        </details>

        <details class="faq-item">
          <summary>¿Puedo borrar datos?</summary>
          <div class="faq-body">Sí. Las ligas, equipos, jugadores y partidos se pueden eliminar con su botón de borrar (siempre con confirmación). Al eliminar una liga se borran también sus equipos, jugadores y partidos en cascada.</div>
        </details>
      </div>
    </div>

    <div style="text-align:center;margin-top:1.5rem;color:var(--text-muted);font-size:0.85rem">
      ¿Sigue alguna duda? Cuéntanosla y la añadimos a esta guía.
    </div>
  `;
}
