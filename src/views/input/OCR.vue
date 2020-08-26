<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Texterkennung und Analyse</h1>
            <div class="content">
                <h2 class="subtitle">Texterkennung (OCR)</h2>
                <p>
                    Neu erkannte PDF-Dateien werden automatisch der Texterkennung zugeführt.
                    Das gilt sowohl für Dateien aus einem <router-link :to="{ name: 'watched-folder-list' }">überwachten Ordner</router-link>, als auch für Uploads per API.
                </p>

                <h2 class="subtitle">Textanalyse</h2>
                <p>
                    Nach Abschluss der Texterkennung wird der Text analysiert, um festzustellen, ob es sich um ein Alarmfax handelt.
                    Ist dies der Fall, werden die Daten als Alarm weiterverarbeitet.
                </p>
                <div class="message is-warning">
                    <p class="message-body">
                        Derzeit wird nur das Alarmfax der ILS Augsburg unterstützt. Den Bedarf für weitere Formate bitte im <a href="https://community.alarmdisplay.org/c/funktionalitaet/alarmzentrale/9">Community-Forum</a> melden.
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
