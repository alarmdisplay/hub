<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Texterkennung</h1>
            <div class="content">
                <p>
                    Neu erkannte PDF-Dateien werden automatisch der Texterkennung zugeführt.
                    Das gilt sowohl für Dateien aus einem überwachten Ordner, als auch für Uploads per API.
                </p>
                <p>
                    Nach Abschluss der Texterkennung wird der Text analysiert, um festzustellen, ob es sich um ein Alarmfax handelt.
                    Ist dies der Fall, werden die Daten als Alarm weiterverarbeitet.
                </p>
                <p>
                    Derzeit wird nur das Alarmfax der ILS Augsburg unterstützt.
                </p>
            </div>
        </div>
    </section>
</template>
