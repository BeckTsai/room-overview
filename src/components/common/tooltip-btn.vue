<script setup lang="ts">
// defineProps<{ icon: string; tip: string }>()

interface Props {
  icon: string;
  tip: string;
  iconSize?: number;
  btnSize?: number;
  backgroundColor?: string;
  hoverEffect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  tip: '',
  iconSize: 24, // minutes
  btnSize: 40,
  backgroundColor: '#3c84f0',
  hoverEffect: false,
});
</script>

<template>
  <div
    class="tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded"
    :class="{ 'hover-effect': hoverEffect }"
    :style="{
      width: `${props.btnSize}px`,
      height: `${props.btnSize}px`,
      'background-color': `${props.backgroundColor}`,
    }"
  >
    <q-icon :name="icon" :size="`${props.iconSize}px`" :color="'white'" />
    <q-tooltip class="tw-bg-[#eeeeee] tw-text-black" anchor="bottom middle" self="top middle">
      {{ tip }}
    </q-tooltip>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.hover-effect {
  opacity: 0.5;
  animation: opacity 0.3s ease-in-out;
  &:hover {
    opacity: 1;
  }
}
</style>
