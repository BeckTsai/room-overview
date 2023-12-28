<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon: string;
  text: string;
  status?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emits = defineEmits(['click']);

const classes = computed(() => {
  const classes = [props.status];

  if (props.disabled) {
    classes.push('disabled');
  }

  return classes;
});
</script>

<template>
  <div class="btn" :class="classes" @click="!disabled && emits('click', $event)">
    <q-icon :name="icon" size="30px" class="tw-mb-[6px]" />
    <div>{{ text }}</div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.btn {
  @apply tw-flex tw-cursor-pointer tw-select-none tw-flex-col tw-items-center tw-p-4 tw-text-xs;
  transition: background-color 0.4s;
  color: #6e6e6e;
  &:hover {
    background-color: #67db7e;
    color: #fff;
  }
  &.err {
    color: #ff5858;
  }
  &.disabled {
    cursor: not-allowed;
    &:hover {
      opacity: 0.5;
      color: #6e6e6e;
    }
  }
}
</style>
