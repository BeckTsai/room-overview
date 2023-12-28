<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useMouse } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { copyToClipboard, useQuasar } from 'quasar';

import { useDomainInfoStore } from '../../stores/domainInfo.store';
import { openOrderListWindow, openEditOrderWindow } from '../../modules/pms.utils';
import { OrderData } from './order-detail-menu.vue';

interface roomDataType {
  bed_type: string;
  en_name: string;
  guests: number | string;
  id: number | string;
  images: Array<string>;
  intro: string;
  name: string;
  order?: OrderData;
  roomNo: string;
  visible: boolean;
}

const $q = useQuasar();
const props = defineProps<{ roomData: roomDataType | any; show: boolean }>();
const emits = defineEmits(['update:show']);
const domainInfo = useDomainInfoStore();
const { setOrders } = domainInfo;
const { domain } = storeToRefs(domainInfo);
const { x, y } = useMouse();

const menuX = ref(0);
const menuY = ref(0);

// touch-position
watch(
  () => props.show,
  (nv) => {
    if (nv) {
      nextTick(() => {
        const elMenu = document.querySelector('#room-card-context-menu') as Element;
        const { clientWidth, clientHeight } = elMenu;
        const { innerWidth, innerHeight } = window;

        if (clientWidth + x.value > innerWidth) {
          menuX.value = x.value - clientWidth < 0 ? 0 : x.value - clientWidth;
        } else {
          menuX.value = x.value;
        }
        if (clientHeight + y.value > innerHeight) {
          menuY.value = y.value - clientHeight < 0 ? 0 : y.value - clientHeight;
        } else {
          menuY.value = y.value;
        }
      });
    }
  },
);

const copyTxt = (text: string) => {
  copyToClipboard(`${text}`)
    .then(() => {
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: `複製「${text}」成功`,
      });
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: `複製「${text}」發生錯誤`,
      });
    });
};

const openPmsOrder = () => {
  const orderNum = props.roomData.order.number;
  const winRef: any = openOrderListWindow(domain.value, orderNum);
  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};

const openPmsEditOrder = () => {
  const bookingId = props.roomData.order.booking_id;
  const winRef: any = openEditOrderWindow(domain.value, bookingId);
  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};
</script>

<template>
  <q-menu
    id="room-card-context-menu"
    :model-value="show"
    :style="{ '--menuY': `${menuY}px`, '--menuX': `${menuX}px` }"
    no-parent-event
    @update:model-value="(e) => emits('update:show', e)"
  >
    <q-list class="tw-min-w-[150px]">
      <q-item class="tw-bg-grey">
        <q-item-section>房號：{{ roomData.roomNo }}</q-item-section>
        <q-separator />
      </q-item>
      <q-item>
        <q-item-section>房間狀態標記</q-item-section>
        <q-tooltip anchor="center right" self="center left" transition-show="jump-right" transition-hide="jump-left">
          尚未開放
        </q-tooltip>
        <q-separator />
      </q-item>
      <template v-if="roomData.order">
        <q-separator />
        <q-item v-close-popup clickable @click="copyTxt(roomData.order.number)">
          <q-item-section class="tw-cursor-pointer"> 訂單編號: {{ roomData.order.number }} </q-item-section>
          <q-tooltip anchor="center right" self="center left" transition-show="jump-right" transition-hide="jump-left">
            點擊複製訂單編號
          </q-tooltip>
        </q-item>
        <q-item v-close-popup clickable @click="openPmsOrder">
          <q-item-section class="tw-cursor-pointer">在 PMS 總表查看</q-item-section>
          <q-tooltip anchor="center right" self="center left" transition-show="jump-right" transition-hide="jump-left">
            點擊開啟分頁
          </q-tooltip>
        </q-item>
        <q-item v-close-popup clickable @click="openPmsEditOrder">
          <q-item-section class="tw-cursor-pointer">編輯訂單</q-item-section>
          <q-tooltip anchor="center right" self="center left" transition-show="jump-right" transition-hide="jump-left">
            點擊開啟編輯頁面
          </q-tooltip>
        </q-item>
      </template>
    </q-list>
  </q-menu>
</template>

<style lang="scss">
#room-card-context-menu {
  max-height: initial !important;
  min-height: initial !important;
  top: var(--menuY) !important;
  left: var(--menuX) !important;
}
</style>
