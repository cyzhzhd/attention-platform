<template>
  <div class="modal-mask" ref="modal">
    <div class="modal-wrapper" v-on:click="closeModal">
      <movableModal
        :size="modalSize"
        class="modal"
        v-if="cctModal"
        @close="cctModal"
      >
        <h3 slot="header" class="header" ref="header">
          <div class="modal-title">집중력 그래프</div>
          <div class="closeModalBtn">
            <i
              class="fa fa-times"
              aria-hidden="true"
              v-on:click="closeModal"
            ></i>
          </div>
        </h3>
        <h4 slot="body">
          <class-chart></class-chart>
        </h4>
        <h4 slot="footer"></h4>
      </movableModal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import movableModal from '../../common/movableModal.vue';
import ClassChart from './ClassChart/ClassChart.vue';

export default {
  name: 'CCTGraph',
  components: {
    movableModal,
    ClassChart,
  },
  data() {
    return {
      modalSize: {
        width: '500px',
        height: '600px',
      },
    };
  },
  computed: {
    cctModal() {
      return this.$store.state.modal.modalList.showingCCTModal;
    },
  },
  watch: {
    cctModal() {
      if (this.cctModal) {
        this.$nextTick(() => {
          this.DragModal({
            modal: this.$refs.modal,
            header: this.$refs.header,
          });
        });
      }
    },
  },
  methods: {
    closeModal() {
      this.$store.dispatch('modal/ControlModal', 'showingCCTModal');
    },
    ...mapActions('modal', ['DragModal']),
  },
};
</script>

<style scoped>
img {
  max-width: 15%;
}

.modal-mask {
  position: absolute;
  z-index: 9998;
  top: 100px;
  left: 100px;
}
.header {
  cursor: move;
  background-color: #ffffff;
  padding: 10px;
}
.header {
  display: flex;
  height: 20px;
  padding: 30px;
}
.modal-title {
  flex: 1;
}

.closeModalBtn {
  cursor: pointer;
}
</style>
