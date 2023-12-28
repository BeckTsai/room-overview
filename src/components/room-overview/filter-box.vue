<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import tooltipBtn from '../common/tooltip-btn.vue';

const props = defineProps<{ filterLabels: string[] }>();
const emits = defineEmits(['update:filterLabels']);

const orderStatusList = ref([
  { isSelected: false, label: '即將入住', val: '' },
  { isSelected: false, label: '已入住', val: '' },
  { isSelected: false, label: '已退房', val: '' },
  { isSelected: false, label: '休息', val: '' },
  { isSelected: false, label: '今日應退', val: '' },
  { isSelected: false, label: '停賣房', val: '' },
  { isSelected: false, label: '超時未退', val: '' },
  { isSelected: false, label: '未結清款項', val: '' },
  { isSelected: false, label: '發票未開', val: '' },
]);

const activeStyle = computed(() => {
  if (props.filterLabels.length === 0) {
    return '#3c84f0';
  } else {
    return '#ff9800';
  }
});

watch(
  orderStatusList,
  (nv) => {
    const filterData = nv.filter((item) => !!item.isSelected);
    if (filterData.length > 0) {
      const filterLabels = filterData.map((item) => item.label);
      emits('update:filterLabels', filterLabels);
    } else {
      emits('update:filterLabels', []);
    }
  },
  { deep: true },
);

const clearFilterLabels = () => {
  orderStatusList.value.forEach((item) => {
    item.isSelected = false;
  });
};
</script>

<template>
  <tooltip-btn icon="filter_alt" tip="過濾條件" :background-color="activeStyle">
    <q-menu class="tw-text-black" :offset="[0, 10]">
      <q-list dense>
        <q-item>
          <q-item-section class="tw-py-2 tw-px-5">
            <q-btn class="tw-bg-[#3c84f0] tw-text-white" @click="clearFilterLabels">清除篩選</q-btn>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable>
          <q-item-section>訂單狀態</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu anchor="top right" self="top left">
            <q-list dense>
              <template v-for="item in orderStatusList" :key="item.label">
                <q-item>
                  <q-checkbox v-model="item.isSelected" class="tw-text-black" :label="item.label" :val="item.val" />
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-menu>
  </tooltip-btn>
</template>

<style scoped lang="scss"></style>
