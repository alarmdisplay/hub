<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Alarmanzeige</h1>
            <p>
                Die Einsätze können an die Alarmanzeige weitergeleitet werden. Dazu benötigt der Server der Alarmanzeige
                einen <router-link :to="{ name: 'api-key-list' }">API-Key</router-link>. Das weitere Vorgehen ist in der
                <a href="https://docs.alarmdisplay.org/de/Anzeige/Installation/Linux.html#page_Mit_der_Alarmzentrale_verbinden">Dokumentation</a> beschrieben.
            </p>
        </div>
    </section>
</template>
