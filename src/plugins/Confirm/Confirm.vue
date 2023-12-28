<script setup lang="ts">
import { ref, computed } from 'vue';
import { QIcon } from 'quasar';

const show = ref(false);
const content = ref('');
const icon = ref('');
const iconSize = ref('');
let resolve: any = null;
const confirmText = ref('');
const cancelText = ref('');

const canResolve = computed(() => typeof resolve === 'function');

const open = (arg: any) => {
  const displaying = show.value;
  if (displaying) return;
  show.value = true;
  icon.value = arg.icon;
  content.value = arg.content;
  iconSize.value = arg.iconSize || '41px';
  confirmText.value = arg.confirmText || '放棄';
  cancelText.value = arg.cancelText || '取消';
  resolve = arg.resolve;
};

const cnofirm = () => {
  show.value = false;
  if (canResolve.value) {
    resolve(true);
    resolve = null;
  }
};

const cancel = () => {
  show.value = false;
  if (canResolve.value) {
    resolve(false);
    resolve = null;
  }
};

defineExpose({
  open,
});
</script>

<template>
  <q-dialog v-model="show" persistent>
    <div class="tw-bg-white tw-px-7 tw-py-6 tw-text-base tw-text-[#6E6E6E]">
      <div class="tw-flex tw-items-center tw-justify-between">
        <q-icon :name="icon" :size="iconSize" color="warning" class="tw-mr-8" />
        <div>{{ content }}</div>
      </div>
      <div class="tw-mt-10 tw-flex tw-justify-end">
        <div class="tw-mr-4 tw-cursor-pointer tw-text-base tw-text-[#1976D2]" @click="cancel">{{ cancelText }}</div>
        <div class="tw-cursor-pointer tw-text-base tw-text-[#1976D2]" @click="cnofirm">{{ confirmText }}</div>
      </div>
    </div>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
