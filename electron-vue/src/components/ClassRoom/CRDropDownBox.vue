<template>
  <div class="contents-tool-box">
    <div class="classroom-detail">
      <div class="classroom-class-name">
        {{ $route.params.classroomName }}
      </div>
    </div>
    <drop-down-box
      v-bind:size="this.size.medium"
      v-if="$store.state.user.isTeacher"
    >
      <div slot="header">수업 만들기</div>
      <div slot="type">
        <div
          class="dropdown-box-contents"
          :class="{
            'dropdown-box-contents-close': !$store.state.dropDownStatus[
              size.medium
            ],
            'dropdown-box-contents-open':
              $store.state.dropDownStatus[size.medium],
          }"
        >
          <div class="create-classroom-form">
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">수업 이름</div>
              <input
                v-model.trim="sessionName"
                placeholder="Enter session Name"
              />
            </div>
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">시작 시간</div>
              <input type="datetime-local" v-model="startTime" />
            </div>
            <div class="create-classroom-input-wrapper">
              <div class="create-classroom-input-label">끝나는 시간</div>
              <input type="datetime-local" v-model="endTime" />
            </div>
            <p class="error-message">{{ errorMessage }}</p>
            <div class="create-classroom-button" @click="createSession()">
              만들기
            </div>
          </div>
        </div>
      </div>
    </drop-down-box>
  </div>
</template>

<script>
import bus from '../../../utils/bus';
import DropDownBox from '../common/DropDownBox.vue';

export default {
  components: {
    DropDownBox,
  },
  data() {
    return {
      size: {
        small: 'small',
        medium: 'medium',
      },
      sessionName: '',
      startTime: '',
      endTime: '',
      errorMessage: '',
    };
  },
  methods: {
    async createSession() {
      const options = {
        name: this.sessionName,
        class: this.$route.params.classroomId,
        scheduledStartTime: `${this.startTime}:00+09:00`,
        scheduledEndTime: `${this.endTime}:00+09:00`,
      };
      const isSuccess = await this.$store.dispatch('CREATE_CLASS', options);
      console.log(isSuccess);
      if (isSuccess) {
        this.$store.dispatch('CHANGE_DROPDOWN_STATUS', this.size.medium);
        bus.$emit('ClassRoom:addClass');
        this.sessionName = '';
        this.startTime = '';
        this.endTime = '';
        this.errorMessage = '';
      } else {
        this.errorMessage = this.$store.state.errorMessage;
        if (!this.sessionName) {
          this.errorMessage = '수업 이름을 입력해주세요';
        }
      }
    },
  },
};
</script>

<style>
.contents-tool-box {
  width: 900px;
  height: 50px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  /* justify-content: flex-end; */
}

.dropdown-box {
  width: 300px;
  height: 52px;
  border: 1px solid #9097fd;
  background-color: #fff;
  padding: 0 16px;
  cursor: pointer;
  position: relative;
}

.dropdown-box-label {
  width: 100%;
  height: 100%;
  color: #9097fd;

  font-family: 'GmarketSansBold';
  font-size: 20px;
  letter-spacing: -1px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-box-contents {
  position: absolute;
  padding: 0 16px;
  left: -1;
  right: -1;
  top: 51px;
  overflow: hidden;
  transition: height 300ms ease-in;
  background-color: #fff;
  z-index: 1000;
  border-right: 1px solid #9097fd;
  border-left: 1px solid #9097fd;
  border-bottom: 1px solid #9097fd;
}

.dropdown-box-contents-close {
  height: 0;
  visibility: hidden;
}

.dropdown-box-contents-open {
  height: auto;
  visibility: visible;
  width: 300px;
  left: -1px;
}

.dropdown-list-item {
  width: 100%;
  height: 52px;
  color: #9097fd;
  font-weight: 400;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.error-message {
  color: #fd9790;
}

.classroom-class-name {
  font-family: 'GmarketSansBold';
  color: #9097fd;
  font-weight: 400;
  font-size: 20px;
  padding-top: 15px;
  margin-left: -20px;
}
</style>
