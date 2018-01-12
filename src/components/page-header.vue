<template lang="html">
  <div class="header">
    {{ user.email }}
    <button type="button" class="btn btn--primary" @click="logout"><i class="fa fa-power-off"></i> Logout</button>
  </div>
</template>

<script>
import { auth } from '../config'
export default {
  name: 'pageHeader',
  data () {
    return {
      user: auth.currentUser
    }
  },
  methods: {
    logout () {
      auth.signOut()
      .then(() => {
        this.$router.push('/')
      })
      .catch(() => {
        console.warn('Sign out failed')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';
.header {
  padding: .8rem .5rem;
  background-color: $blue-light-1;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
