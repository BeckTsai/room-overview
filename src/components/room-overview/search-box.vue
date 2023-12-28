<script setup lang="ts">
import { ref, computed, toRefs } from 'vue';

interface btnType {
  placeHolder: string;
  type: string;
  searchKey: Array<string>;
  icon: string;
  tip: string;
  name: string;
}

interface Props {
  btnTypes: btnType[];
  inputValue: string;
  currentSearchType: any;
}

const props = defineProps<Props>();

const emits = defineEmits(['update:inputValue', 'update:currentSearchType']);

const { inputValue } = toRefs(props);

const emptyType = {
  placeHolder: '請指定右側搜尋項目',
  type: '',
  searchKey: [''],
};

const searchType = ref('');

const activeType = computed(() => {
  if (!props.currentSearchType) return emptyType;
  const result = props.btnTypes.find((item) => item.type === props.currentSearchType.type);
  return result || emptyType;
});

const isActiveType = (type: string) => type === activeType.value.type;

const setType = (data: btnType) => {
  searchType.value = data.type;
  emits('update:currentSearchType', data);
};
</script>

<template>
  <div class="tw-item-center tw-flex tw-rounded-sm tw-bg-[#e0e0e0] tw-px-[10px]">
    <q-input
      :model-value="inputValue"
      class="tw-p-5"
      :placeholder="activeType.placeHolder"
      :disable="!searchType"
      outlined
      dense
      debounce="500"
      @update:model-value="(e) => emits('update:inputValue', e)"
    >
      <template v-if="inputValue" #append>
        <q-icon name="cancel" class="cursor-pointer" @click.stop="emits('update:inputValue', '')" />
      </template>
    </q-input>
    <template v-for="item in btnTypes" :key="item.type">
      <div
        class="tw-flex tw-w-[65px] tw-cursor-pointer tw-select-none tw-flex-col tw-items-center tw-justify-center"
        :class="[isActiveType(item.type) ? 'tw-bg-orange' : 'tw-text-[#646464]']"
        @click="setType(item)"
      >
        <q-icon :name="item.icon" :style="`color: ${isActiveType(item.type) ? '#fff' : '#646464'}`" size="20px" />
        <p :class="[isActiveType(item.type) ? 'tw-text-white' : 'tw-text-[#646464]']">
          {{ item.name }}
        </p>
        <q-tooltip class="tw-bg-[#eeeeee] tw-text-black" anchor="bottom middle" self="top middle">
          {{ item.tip }}
        </q-tooltip>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
