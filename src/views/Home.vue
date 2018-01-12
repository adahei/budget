<template lang="html">
  <div class="page-wrap">
    <page-header class="page-header"/>
    <router-view class="page-main"/>
  </div>
</template>

<script>
import { auth } from '../config'
import PageHeader from '@/components/page-header'
export default {
  beforeRouteEnter (to, from, next) {
    // get the current logged in user
    auth.onAuthStateChanged((user) => {
      if (user) {
        next()
      } else {
        next('/login')
      }
    })
  },
  components: {
    'page-header': PageHeader
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {

}
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  z-index: 10;
}
.page-main {
  margin-top: 70px;
}

</style>
