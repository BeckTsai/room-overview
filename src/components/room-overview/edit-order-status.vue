<script setup lang="ts">
import { computed, ref } from 'vue';
import { QDialog, useQuasar } from 'quasar';
import safeAwait from 'safe-await';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';

import { useDomainInfoStore } from '../../stores/domainInfo.store';
import { OrderData } from './order-detail-menu.vue';
import { getOrder, postRoomStatus } from '../../composables/use-api-pms';
import { OrderRoom, Order } from '../../types/pms.type';
import { openOrderSetRoomWindow } from '../../modules/pms.utils';

import BaseBtn from '../common/base-btn.vue';

interface OrderRoomType {
  number: string;
  status: any;
  ori: OrderRoom;
}

dayjs.extend(isBetween);
const $q = useQuasar();
const domainInfo = useDomainInfoStore();
const { setOrders } = domainInfo;
const { domain } = storeToRefs(domainInfo);

const props = defineProps<{ orderData: OrderData }>();
const emits = defineEmits(['ok']);

const selectOptions = [
  {
    label: '即將入住',
    value: 'UPCOMING',
  },
  {
    label: '已入住',
    value: 'CHECKED_IN',
  },
  {
    label: '退房',
    value: 'CHECKED_OUT',
  },
];

const dialog = ref<InstanceType<typeof QDialog>>();
const show = ref(false);
const orderRoomList = ref<OrderRoomType[]>([]);

const diffRoomStatus = computed(() => {
  const diffRooms = orderRoomList.value
    .filter((room) => {
      return room.status !== room.ori.status;
    })
    .map((room) => {
      return {
        params: { id: room.ori.id },
        data: { status: room.status },
        number: room.number,
      };
    });
  return diffRooms;
});

const getOrderData = async () => {
  const [err, data] = await safeAwait(getOrder(props.orderData.number));
  if (err) {
    console.log(`error get order ${err}`);
    return;
  }
  orderRoomList.value = (data as Order).rooms.map((room) => {
    return { number: room.number, status: room.status, ori: room };
  }) as OrderRoomType[];
};

const openPmsOrderSetRoom = () => {
  const winRef = openOrderSetRoomWindow(domain.value, props.orderData.number) as Window;
  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      getOrderData();
      emits('ok');
    }
  }, 100);
};

/** 判斷是否為有效的房間項目
 * 包含開始與結束日期。
 * 例：
 * 帶測日：07-27
 * 範圍：07-27 ~ 07-30
 * 結果為有效
 */
const isInvalidRoomItem = (roomData: OrderRoom) => {
  return !dayjs().isBetween(roomData.start_date, roomData.check_out, null, '[]');
};

const updateRoomStatus = async (config: any) => {
  const [err] = await safeAwait(postRoomStatus(config.params, config.data));
  if (err) {
    console.error(`[ updateRoomStatus ] err : `, err);
    $q.notify({
      type: 'negative',
      message: `${config.number} 房更新入住狀態失敗`,
    });
    return;
  }

  $q.notify({
    type: 'positive',
    message: `${config.number} 房更新入住狀態成功`,
  });
};

const save = async () => {
  if (diffRoomStatus.value.length === 0) return;

  const requests = diffRoomStatus.value.map((data) => {
    return updateRoomStatus(data);
  });
  const [err] = await safeAwait(Promise.all(requests));
  getOrderData();

  if (err) {
    console.error(`[ submitOk ] err :`, err);
    return;
  }
  emits('ok');
};

getOrderData();
</script>

<template>
  <q-dialog ref="dialog" v-model="show" no-backdrop-dismiss>
    <q-card class="tw-w-[413px] tw-overflow-hidden tw-bg-[#eee] tw-p-7 tw-text-xs tw-text-black">
      <div class="tw-mb-7 tw-flex tw-items-center tw-justify-between">
        <div>
          <div class="tw-text-lg">訂單 {{ orderData.number }} 入住狀態調整</div>
          <div class="tw-text-xs tw-text-[#737373]">可同時快速變更同筆訂單房間狀態</div>
        </div>
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
        <div class="tw-flex">
          <base-btn icon="bedroom_parent" text="訂單配房" @click="openPmsOrderSetRoom">
            <q-tooltip
              class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
              anchor="center middle"
              self="center middle"
              transition-show="fade"
              transition-hide="fade"
            >
              開啟 PMS 配房功能
            </q-tooltip>
          </base-btn>
          <base-btn icon="refresh" text="重讀狀態" @click="emits('ok')">
            <q-tooltip
              class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
              anchor="center middle"
              self="center middle"
              transition-show="fade"
              transition-hide="fade"
            >
              重新讀取 PMS 房間狀態
            </q-tooltip>
          </base-btn>
        </div>
      </q-card>
      <q-card
        class="tw-flex tw-h-[437px] tw-flex-col tw-items-center tw-overflow-y-auto tw-bg-white tw-p-4 tw-px-[30px] tw-text-base"
      >
        <template v-for="room in orderRoomList" :key="room.number">
          <div class="tw-mb-6 tw-w-full">
            <div class="tw-mb-2 tw-flex">
              <div class="tw-mr-7 tw-flex-1 tw-text-lg tw-font-medium">{{ room.number }}</div>
              <q-select
                v-model="room.status"
                class="tw-w-[190px]"
                :options="selectOptions"
                :disable="isInvalidRoomItem(room.ori)"
                emit-value
                outlined
                map-options
                dense
              />
            </div>
            <div class="tw-text-xs tw-text-wasabiYellow"
              >入退時間：{{ room.ori.start_date }} ~ {{ room.ori.check_out }}</div
            >
          </div>
        </template>
      </q-card>
      <div class="tw-mt-5 tw-flex tw-items-center tw-justify-center">
        <q-btn class="tw-mr-7 tw-w-44" color="grey" text-color="white" label="取消" @click="show = false" />
        <q-btn class="tw-w-44" color="green" text-color="white" label="確認變更" @click="save" />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
