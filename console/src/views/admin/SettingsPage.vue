<template>
  <section class="section">
    <div class="container">
      <h1 class="title mb-6">
        Einstellungen
      </h1>

      <h2 class="subtitle">
        Überwachte Ordner
      </h2>
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th scope="col">
              Einstellung
            </th>
            <th scope="col">
              Wert
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              Bereits verarbeitete Dateien ignorieren
            </th>
            <td><BooleanValue settings-key="ignore_processed_files" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import BooleanValue from '@/components/admin/settings/BooleanValue'

export default {
  name: 'SettingsPage',
  components: {
    BooleanValue
  },
  created () {
    // Fetch all settings
    const { Setting } = this.$FeathersVuex.api
    Setting.find()
  }
}
</script>

<style scoped>

</style>
