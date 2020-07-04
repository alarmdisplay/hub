<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Konten</h1>
            <table class="table">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Angelegt am</th>
                    <th>Aktionen</th>
                </tr>
                </thead>
                <tbody>
                <template v-for="user in users">
                    <tr :key="user.id">
                        <th>{{ user.email }}</th>
                        <td>{{ user.createdAt }}</td>
                        <td>
                            TODO: Buttons
                        </td>
                    </tr>
                </template>
                </tbody>
            </table>
        </div>
    </section>
</template>

<script>
  import api from '../../api/users'

  export default {
    name: 'Users',
    data() {
      return {
        users: []
      }
    },
    created () {
      this.getUsers()
    },
    methods: {
      getUsers: function () {
        console.log('getUsers')
        api.find()
          .then(response => {
            this.users = response.data
          })
          .catch(reason => {
            console.error('Could not get users', reason)
          })
      }
    },
    watch: {
      '$route': 'getUsers'
    }
  }
</script>

<style scoped>

</style>
