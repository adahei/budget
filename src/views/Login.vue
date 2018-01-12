<template>
  <fieldset class="login">
    <form @submit.prevent="login">
      <h1>Login</h1>
      <div class="alert alert--error" v-if="error">
        {{ error }}
      </div>
      <div class="form-control">
        <label for="email">E-mail</label>
        <input type="email" id="email" v-model="email">
      </div>
      <div class="form-control">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password">
      </div>
      <div class="login__btn-bar">
        <button type="submit" class="btn btn--primary" @click="login">Login</button>
      </div>
    </form>
  </fieldset>
</template>

<script>
import { auth } from '../config'
export default {
  name: 'login',
  data () {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    login () {
      // login to firebase with email and password
      this.error = ''
      auth.signInWithEmailAndPassword(this.email, this.password)
      .then((user) => {
        this.$router.push('/home')
      })
      .catch((error) => {
        this.error = error.message
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  background-color: #fff;
  max-width: 400px;
  margin: 2rem auto;
  &__btn-bar {
    text-align: right;
  }
}
</style>
