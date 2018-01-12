<template lang="html">
  <div>
    <header class="header">
      <h1 class="center">Predict expences</h1>
    </header>
    <main class="main">
      <h2 class="center">Online spending plan and budgeting tool</h2>
      <p>Plan and document your expences in order to get a better overview on what you do with your money.</p>
      <div class="center">
        <router-link to="login" class="btn btn--primary btn--lg">Login</router-link>
      </div>
    </main>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';
.header {
  background-color: $blue-light-1;
  color: $white;
  padding: 1rem;
  margin: 0;
  > h1 {
    margin: 0;
  }
}
.main {
  max-width: 600px;
  background-color: $white;
  padding: 1rem;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0,0,0,.05);
}
.center {
  text-align: center;
}
</style>
