<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Anzeige
      </h1>
      <p>
        Die Einsätze können an die Anzeige weitergeleitet werden. Dazu benötigt der Server der Anzeige
        einen <router-link :to="{ name: 'api-key-list' }">
          API-Key
        </router-link>. Das weitere Vorgehen ist in der
        <a href="https://docs.alarmdisplay.org/de/Anzeige/Konfiguration#page_Mit_der_Zentrale_verbinden">Dokumentation</a> beschrieben.
      </p>
    </div>
  </section>
</template>
