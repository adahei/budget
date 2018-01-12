<template lang="html">
  <transition name="modal">
    <div class="modal" ref="modal" v-if="visible">
      <section class="modal__content">
        <header class="modal__content__header">
          <h3>{{ title }}</h3> <button type="button" class="modal__close btn btn--cancel" @click="close"><i class="fa fa-close"></i></button>
        </header>
        <div class="modal__content__main">
          <slot name="content"></slot>
        </div>
        <footer class="modal__content__footer">
          <slot name="footer"></slot>
        </footer>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    }
  },
  methods: {
    close () {
      this.$emit('close', true)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';
.modal {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: rgba(0,0,0,.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .3s ease;
  &__content {
    position: relative;
    width: 98%;
    max-width: 700px;
    min-height: 100px;
    max-height: 80%;
    background-color: $white;
    box-shadow: 0 0 10px rgba(0,0,0,.5);
    transition: all .3s ease;
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .5rem;
      background-color: $gray-light-3;
      color: $gray-dark-4;
      border-bottom: 1px solid $gray-light-1;
      margin: 0;
      > h3 {
        margin: 0;
      }
    }
    &__main {
      padding: 1rem 2rem;
    }
    &__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .5rem;
      background-color: $gray-light-3;
      border-top: 1px solid $gray-light-1;
      margin: 0;
    }
  }
}
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal__content,
.modal-leave-active .modal__content {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
