<script setup lang="ts">
import { ref } from 'vue';
import { QDialog, useQuasar } from 'quasar';

import BaseBtn from '../common/base-btn.vue';
import UploaderOrderFileDialog from './uploader-order-file-dialog.vue';
import { OrderData, OrderFils } from './order-detail-menu.vue';

const $q = useQuasar();
const props = defineProps<{ orderData: OrderData; filePhotesList: OrderFils[] }>();
const emits = defineEmits(['ok']);

const dialog = ref<InstanceType<typeof QDialog>>();
const show = ref(false);

const openFileUploader = () => {
  $q.dialog({
    component: UploaderOrderFileDialog,
    componentProps: { orderData: props.orderData },
  }).onOk(() => {
    emits('ok');
  });
};
</script>

<template>
  <q-dialog ref="dialog" v-model="show" no-backdrop-dismiss>
    <q-card class="tw-w-[413px] tw-overflow-hidden tw-bg-[#eee] tw-p-4 tw-text-xs tw-text-black">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-my-2 tw-ml-9 tw-text-lg">訂單 {{ orderData.number }} 文件檢視/上傳</div>
        <div
          class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
          @click="show = false"
        >
          <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
        </div>
      </div>
      <q-card
        class="tw-mb-2 tw-flex tw-items-center tw-justify-between tw-bg-white tw-pl-[30px] tw-pr-[10px] tw-text-base"
      >
        <div>功能列表</div>
        <base-btn icon="refresh" text="重讀狀態" @click="emits('ok')" />
      </q-card>
      <q-card
        class="tw-mb-2 tw-flex tw-items-center tw-justify-between tw-bg-white tw-pl-[30px] tw-pr-[10px] tw-text-base"
      >
        <div>居隔單</div>
        <div class="tw-flex">
          <base-btn icon="file_upload" text="上傳" @click="openFileUploader" />
        </div>
      </q-card>
      <q-card
        class="tw-flex tw-h-[437px] tw-flex-col tw-items-center tw-overflow-y-auto tw-bg-white tw-p-4 tw-pr-[10px] tw-text-base"
      >
        <template v-for="item in filePhotesList" :key="item.id">
          <img :src="item.file" class="tw-mb-2 tw-h-[140px] !tw-w-[230px]" />
        </template>
      </q-card>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
