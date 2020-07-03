<template>
  <div id="app">
    <Navbar/>
    <section class="section">
      <div class="container">
        <h1 class="title">
          Hello World
        </h1>
        <p class="subtitle">
          My first website with <strong>Bulma</strong>!
        </p>
      </div>
    </section>
  </div>
</template>

<script>
import 'bulma/css/bulma.css'
import Navbar from './components/Navbar'
export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
</style>
