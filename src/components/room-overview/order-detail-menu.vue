<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useMouse } from '@vueuse/core';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import safeAwait from 'safe-await';
import { getOrderFiles } from '../../composables/use-api-pms';
import { useDomainInfoStore } from '../../stores/domainInfo.store';
import { Order, OrderRoom } from '../../types/pms.type';
import {
  keyToText,
  openTransactionWindow,
  openInvoiveWindow,
  openEditOrderWindow,
  openOrderSetRoomWindow,
} from '../../modules/pms.utils';
import BaseBtn from '../common/base-btn.vue';
import DocCollectionIdPhotosDialog from './doc-collection-id-photos-dialog.vue';
import DocCollectionOrderFileDialog from './doc-collection-order-file-dialog.vue';
import PrintInvoiceDialog from './print-invoice-dialog.vue';
import EditOrderStatus from './edit-order-status.vue';

export interface OrderData extends Order {
  room: OrderRoom;
}

export interface OrderFils {
  OCR: Array<any>;
  file: string;
  id: number | string;
  type: number | string;
}

const props = defineProps<{ orderData: OrderData | any; show: boolean }>();
const emits = defineEmits(['update:show']);

const $q = useQuasar();
const menuX = ref(0);
const menuY = ref(0);
const idPhotesList = ref<OrderFils[]>([]);
const filePhotesList = ref<OrderFils[]>([]);
const { x, y } = useMouse();
const domainInfo = useDomainInfoStore();
const { setOrders } = domainInfo;
const { domain } = storeToRefs(domainInfo);

const room = computed(() => props.orderData.room || null);

const invoiceStatus = computed(() => {
  if (!props.orderData.invoice) {
    return {
      msg: '不須開立',
    };
  }

  if (!props.orderData?.invoices || props.orderData?.invoices?.length === 0) {
    return {
      msg: '未開立',
    };
  }

  if (props.orderData?.invoice && props.orderData?.invoices?.length > 0) {
    return {
      msg: '部分金額尚未開立',
    };
  }

  return {
    msg: '已開立',
  };
});

const paymentStatus = computed(() => {
  const { unpaid_raw: unpaidRaw } = props.orderData;
  if (!unpaidRaw) {
    return {
      key: '',
      msg: '無訂單',
    };
  }

  const orderNum = props.orderData.number;
  if (!orderNum) {
    return {
      key: '',
      msg: '無訂單',
    };
  }

  const unpaid = parseFloat(unpaidRaw);
  if (unpaid === 0) {
    return {
      key: 'suc',
      msg: '已付款',
    };
  }

  return {
    key: 'err',
    msg: '未付款',
  };
});

const openPmsTransaction = () => {
  if (paymentStatus.value.key === '') {
    $q.notify({
      type: 'negative',
      message: '不可新增金流',
    });
    return;
  }

  const winRef: any = openTransactionWindow(domain.value, props.orderData.number);

  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};

const makeInvoiceBtnStatus = computed(() => {
  if (!props.orderData.invoice) {
    return {
      key: '',
      msg: 'PMS 無須開立發票',
    };
  }

  return {
    key: 'err',
    msg: '開啟 PMS 開立發票功能',
  };
});

const idPhotosStatus = computed(() => {
  if (!idPhotesList.value.length) {
    return {
      key: 'err',
      msg: '無證件資料',
    };
  }

  return {
    key: '',
    msg: '',
  };
});

const openPmsInvoive = () => {
  const bookingId = props.orderData.booking_id;
  const winRef: any = openInvoiveWindow(domain.value, bookingId);

  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};

const openPmsEditOrder = () => {
  const bookingId = props.orderData.booking_id;
  const winRef: any = openEditOrderWindow(domain.value, bookingId);

  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};

const openPmsOrderSetRoom = () => {
  const orderNum = props.orderData.number;

  const winRef = openOrderSetRoomWindow(domain.value, orderNum) as Window;

  const timer = setInterval(() => {
    if (winRef.closed) {
      clearInterval(timer);
      setOrders();
    }
  }, 100);
};

const printInvoiceBtnStatus = computed(() => {
  if (!props.orderData.invoice && props.orderData.invoices.length === 0) {
    return {
      key: '',
      msg: '未開立發票無法列印',
    };
  }

  if (!props.orderData.invoices || props.orderData.invoices.length === 0) {
    return {
      key: '',
      msg: '未開立發票無法列印',
    };
  }

  return {
    key: 'suc',
    msg: '使用發票列印功能',
  };
});

const getOrderFile = async () => {
  if (!props.orderData) return Promise.resolve();
  const [, resp] = await safeAwait(getOrderFiles(props.orderData.number));
  idPhotesList.value = (resp as OrderFils[]).filter((item) => item.type === 1);
  filePhotesList.value = (resp as OrderFils[]).filter((item) => item.type === 2);
  return Promise.resolve();
};

// touch-position
watch(
  () => props.show,
  (nv) => {
    if (nv) {
      getOrderFile();
      nextTick(() => {
        const elMenu = document.querySelector('#order-detail-menu') as Element;
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

const parseAmount2Number = (str: string) => {
  const numStr = `${str}`.replace(/[$,]/g, '');
  return parseFloat(numStr);
};

const openWebCamUploader = () => {
  const dialog = $q
    .dialog({
      component: DocCollectionIdPhotosDialog,
      componentProps: { orderData: props.orderData, idPhotesList: idPhotesList.value },
    })
    .onOk(async () => {
      await getOrderFile();
      dialog.update({ idPhotesList: idPhotesList.value });
    })
    .onDismiss(async () => {
      await getOrderFile();
      dialog.update({ idPhotesList: idPhotesList.value });
    });
};
const openOrderFileUploader = () => {
  const dialog = $q
    .dialog({
      component: DocCollectionOrderFileDialog,
      componentProps: { orderData: props.orderData, filePhotesList: filePhotesList.value },
    })
    .onOk(async () => {
      await getOrderFile();
      dialog.update({ filePhotesList: filePhotesList.value });
    })
    .onDismiss(async () => {
      await getOrderFile();
      dialog.update({ filePhotesList: filePhotesList.value });
    });
};

const openPrintInvoiceDialog = () => {
  $q.dialog({
    component: PrintInvoiceDialog,
    componentProps: { orderData: props.orderData },
  });
};
const openEditorOrderStatus = () => {
  const dialog = $q
    .dialog({
      component: EditOrderStatus,
      componentProps: { orderData: props.orderData },
    })
    .onOk(async () => {
      await setOrders();
      dialog.update({ orderData: props.orderData });
    });
};
</script>
<template>
  <q-menu
    id="order-detail-menu"
    :model-value="show"
    :style="{ '--menuY': `${menuY}px`, '--menuX': `${menuX}px` }"
    no-parent-event
    persistent
    :auto-close="false"
  >
    <q-card v-if="orderData" class="tw-h-[80vh] tw-max-h-[725px] tw-overflow-hidden tw-bg-[#eee] tw-p-2 tw-text-black">
      <div class="tw-flex tw-items-center tw-justify-between tw-p-6">
        <div class="tw-flex tw-items-center tw-justify-between tw-text-base tw-font-medium">
          <div>{{ room.number }}</div>
          <div class="tw-ml-4">{{ room.type }}</div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-mr-1">[Esc]</div>
          <div
            class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
            @click="emits('update:show', false)"
          >
            <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
          </div>
        </div>
      </div>
      <div class="tw-max-h-[90%] tw-overflow-y-auto tw-pb-3">
        <div class="tw-flex tw-w-[850px] tw-justify-between">
          <div class="tw-mr-1 tw-flex-1">
            <q-card class="tw-mb-1 tw-flex tw-flex-col tw-bg-[#807f7f] tw-p-5 tw-text-white">
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">訂單編號</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.number }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">平台編號</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.platform_number }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">入住時間</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ room.start_date }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">退房時間</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ room.check_out }}</div>
              </div>
            </q-card>
            <q-card class="tw-mb-1 tw-flex tw-flex-col tw-bg-[#807f7f] tw-p-5 tw-text-white">
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">姓名</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.name }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">聯絡電話</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.phone }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">電子信箱</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.email }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">國籍別</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.nationality }}</div>
              </div>
              <div class="tw-inline-flex tw-items-center">
                <div class="tw-w-[60px]">出發國家</div>
                <div class="tw-ml-1 tw-mr-[10px]">|</div>
                <div>{{ orderData.departure }}</div>
              </div>
            </q-card>
            <q-card class="tw-mb-1 tw-flex tw-px-2">
              <div class="tw-flex tw-flex-1 tw-flex-col tw-justify-center tw-p-4">
                <div class="tw-inline-flex tw-items-center">
                  <div class="tw-w-[60px]">訂單金額</div>
                  <div class="tw-ml-1 tw-mr-[10px]">|</div>
                  <div>{{ parseAmount2Number(orderData.price) }}</div>
                </div>
                <div class="tw-inline-flex tw-items-center">
                  <div class="tw-w-[60px]">未付金額</div>
                  <div class="tw-ml-1 tw-mr-[10px]">|</div>
                  <div>{{ parseAmount2Number(orderData.unpaid_raw) }}</div>
                </div>
              </div>
              <base-btn
                class="tw-flex-1"
                icon="payments"
                text="編輯金流"
                :status="paymentStatus.key"
                @click="openPmsTransaction"
              >
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  開啟 PMS 編輯金流頁面
                </q-tooltip>
              </base-btn>
            </q-card>
            <q-card class="tw-mb-1 tw-flex tw-px-2">
              <div class="tw-flex tw-flex-1 tw-flex-col tw-justify-center tw-p-4">
                <div class="tw-inline-flex tw-items-center">
                  <div class="tw-w-[60px]">證件狀態</div>
                  <div class="tw-ml-1 tw-mr-[10px]">|</div>
                  <div>{{ idPhotosStatus.key ? '未上傳' : '已上傳' }}</div>
                </div>
              </div>
              <base-btn
                class="tw-flex-1"
                icon="file_upload"
                :status="idPhotosStatus.key"
                text="檢視/上傳"
                @click="openWebCamUploader"
              >
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  檢視或上傳照片
                </q-tooltip>
              </base-btn>
            </q-card>
            <q-card class="tw-mb-1 tw-flex tw-px-2">
              <div class="tw-flex tw-flex-[2] tw-flex-col tw-justify-center tw-p-4">
                <div class="tw-inline-flex tw-items-center">
                  <div class="tw-w-[60px]">發票狀態</div>
                  <div class="tw-ml-1 tw-mr-[10px]">|</div>
                  <div>{{ invoiceStatus.msg }}</div>
                </div>
              </div>
              <base-btn
                class="tw-flex-1"
                icon="receipt"
                text="開立發票"
                :disabled="!makeInvoiceBtnStatus.key"
                :status="makeInvoiceBtnStatus.key"
                @click="openPmsInvoive"
              >
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  {{ makeInvoiceBtnStatus.msg }}
                </q-tooltip>
              </base-btn>
              <base-btn
                class="tw-flex-1"
                icon="receipt_long"
                text="列印發票"
                :disabled="!printInvoiceBtnStatus.key"
                :status="printInvoiceBtnStatus.key"
                @click="openPrintInvoiceDialog"
              >
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  {{ printInvoiceBtnStatus.msg }}
                </q-tooltip>
              </base-btn>
            </q-card>
            <q-card class="tw-flex tw-px-2">
              <div class="tw-flex tw-flex-[2] tw-flex-col tw-justify-center tw-p-4">
                <div class="tw-inline-flex tw-items-center">
                  <div class="tw-w-[60px]">入住狀態</div>
                  <div class="tw-ml-1 tw-mr-[10px]">|</div>
                  <div>{{ keyToText('orderStatus', room.status) }}</div>
                </div>
              </div>
              <base-btn class="tw-flex-1" icon="published_with_changes" text="變更狀態" @click="openEditorOrderStatus">
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  變更該訂單房間狀態
                </q-tooltip>
              </base-btn>
              <base-btn class="tw-flex-1" icon="logout" text="快速退房" disabled>
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  功能尚未開放
                </q-tooltip>
              </base-btn>
            </q-card>
          </div>
          <div class="tw-flex-1">
            <q-card class="tw-mb-1 tw-flex tw-bg-white tw-px-5">
              <base-btn class="tw-flex-1" icon="fact_check" text="編輯訂單" @click="openPmsEditOrder" />
              <base-btn class="tw-flex-1" icon="bedroom_parent" text="訂單配房" @click="openPmsOrderSetRoom" />
              <base-btn class="tw-flex-1" icon="file_upload" text="上傳資料" @click="openOrderFileUploader" />
              <base-btn class="tw-flex-1" icon="article" text="編輯備註" disabled>
                <q-tooltip
                  class="tw-bg-white tw-text-black tw-shadow-[0_0_4px_0_rgba(0,0,0,0.25)]"
                  anchor="center middle"
                  self="center middle"
                  transition-show="fade"
                  transition-hide="fade"
                >
                  功能尚未開放
                </q-tooltip>
              </base-btn>
            </q-card>
            <q-card class="tw-mb-1 tw-p-5 tw-text-sm">
              <div class="tw-text-base tw-font-medium">PMS 備註內容</div>
              <div v-if="orderData.comment">{{ orderData.comment }}</div>
              <div v-else class="tw-text-[#f44336]">無內容</div>
            </q-card>
            <q-card v-if="orderData.microstay" class="tw-p-5 tw-text-sm">
              <div class="tw-text-base tw-font-medium">休息房</div>
              <div class="tw-flex tw-items-center tw-p-5">
                <div class="tw-mr-4">開始時間</div>
                <div>{{ orderData.microstay.check_in }} </div>
              </div>
              <div class="tw-flex tw-items-center tw-p-5">
                <div class="tw-mr-4">結束時間</div>
                <div>{{ orderData.microstay.est_check_out }} </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </q-card>
  </q-menu>
</template>

<style lang="scss">
#order-detail-menu {
  max-height: initial !important;
  min-height: initial !important;
  top: var(--menuY) !important;
  left: var(--menuX) !important;
}
</style>
