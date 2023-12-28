<script setup lang="ts">
import { ref } from 'vue';
import { useDomainInfoStore } from '../../stores/domainInfo.store';
import { storeToRefs } from 'pinia';
import { QDialog, useQuasar } from 'quasar';
import { openRoomSchedulerWindow } from '../../modules/pms.utils';

import { OrderData } from './order-detail-menu.vue';

const $q = useQuasar();
const domainInfo = useDomainInfoStore();
const { setOrders } = domainInfo;
const { domain } = storeToRefs(domainInfo);

const props = defineProps<{ orderData: OrderData }>();

const dialog = ref<InstanceType<typeof QDialog>>();
const show = ref(false);

const openPmsEditOrder = () => {
  const winRef: any = openRoomSchedulerWindow(domain.value);

  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};
</script>

<template>
  <q-dialog ref="dialog" v-model="show" no-backdrop-dismiss>
    <q-card class="tw-w-[413px] tw-overflow-hidden tw-bg-[#eee] tw-p-4 tw-text-xs tw-font-medium tw-text-black">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-my-2 tw-text-lg">{{ orderData.room.number }}{{ orderData.room.type }} </div>
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-mr-1">[Esc]</div>
          <div
            class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
            @click="show = false"
          >
            <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
          </div>
        </div>
      </div>
      <q-card class="tw-mb-1 tw-bg-[#d194ff] tw-p-5 tw-text-center tw-text-lg tw-text-white"> 停賣房 </q-card>
      <q-card class="tw-mb-1 tw-flex tw-text-center tw-text-sm tw-text-white">
        <div class="tw-bg-[#807f7f] tw-p-5">
          <div class="tw-flex">
            <div>開始時間</div>
            <div class="tw-ml-3 tw-mr-2">｜</div>
            <div>{{ orderData.room.start_date }}</div>
          </div>
          <div class="tw-flex">
            <div>結束時間</div>
            <div class="tw-ml-3 tw-mr-2">｜</div>
            <div>{{ orderData.room.check_out }}</div>
          </div>
        </div>
        <div
          class="tw-flex tw-flex-1 tw-cursor-pointer tw-items-center tw-justify-center tw-bg-[#67db7e]"
          @click="openPmsEditOrder"
        >
          PMS 配房系統
        </div>
      </q-card>
      <q-card class="tw-bg-[#807f7f] tw-p-5 tw-text-white">
        <div class="tw-flex">
          <div>通報說明</div>
          <div class="tw-ml-3 tw-mr-2">｜</div>
          <div>{{ orderData.room.report }}</div>
        </div>
      </q-card>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
