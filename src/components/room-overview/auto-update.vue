<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { getNowTime } from '../../modules/utils';

interface Props {
  update: () => void;
  interval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  interval: 30, // minutes
});

const $q = useQuasar();
const isOpen = ref(true);
const updatedAt = ref(getNowTime('YYYY-MM-DD HH:mm'));

const handleUpdateData = async () => {
  $q.loading.show();
  await props.update();
  updatedAt.value = getNowTime('YYYY-MM-DD HH:mm');
  $q.loading.hide();
};

const autoUpdates = setInterval(async () => {
  handleUpdateData();
}, props.interval * 60 * 1000);

watch(
  isOpen,
  (value) => {
    if (value) {
      autoUpdates;
    } else {
      clearInterval(autoUpdates);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="tw-flex tw-select-none tw-items-center tw-rounded-sm tw-bg-[#c4c4c4] tw-px-[29px]">
    <div
      class="tw-mr-5 tw-flex tw-h-10 tw-w-10 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded tw-bg-blue"
      @click="handleUpdateData"
    >
      <q-icon name="autorenew" size="24px" color="white" />
    </div>
    <div class="switch-btn" :class="{ active: isOpen }" @click="isOpen = !isOpen">
      <q-icon name="autorenew" size="24px" style="color: #374556" />
      <div class="tw-flex tw-flex-col tw-justify-center tw-px-[10px] tw-text-center tw-text-xs">
        <div>自動更新</div>
        <div>{{ updatedAt }}</div>
      </div>
      <q-tooltip class="tw-bg-[#eeeeee] tw-text-black" anchor="bottom middle" self="top middle">
        每{{ interval }}分鐘更新
      </q-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.switch-btn {
  @apply tw-flex tw-h-10 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded tw-px-[10px] tw-py-[5px];
  background: none;
  border: 1px solid #374556;
  .q-icon {
    animation: rotate 2s infinite ease-in-out;
    animation-play-state: paused;
  }
}

.active {
  @apply tw-bg-white tw-text-[#ff9446];
  border-color: #fff;
  .q-icon {
    color: #ff9446 !important;
    animation-play-state: running;
  }
}
</style>
