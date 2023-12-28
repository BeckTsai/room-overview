<script setup lang="ts">
import { computed, ComputedRef, ref, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';

import { OrderRoom, OrderMicrostay } from '../../types/pms.type';
import { useDomainInfoStore } from '../../stores/domainInfo.store';
import TooltipBtn from '../common/tooltip-btn.vue';
import MenuHover from '../common/menu-hover.vue';
import { OrderData } from './order-detail-menu.vue';

const fakeCommentList = [
  {
    date: '2022年5月17日 10:15',
    user: 'Beck',
    comment: '房間有電燈壞掉，冰箱壞掉，熱水壺壞掉，蓮蓬頭壞掉，已告知過客人',
  },
  {
    date: '2022年5月17日 10:14',
    user: 'Beck',
    comment: '房間有電燈壞掉，冰箱壞掉，熱水壺壞掉，蓮蓬頭壞掉，已告知過客人',
  },
  {
    date: '2022年5月17日 10:13',
    user: 'Beck',
    comment: '房間有電燈壞掉，冰箱壞掉，熱水壺壞掉，蓮蓬頭壞掉，已告知過客人',
  },
];

interface TagsType {
  iconBg: string;
  icon: string;
  tip: string;
  label: string;
  hide: boolean;
}

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
  tags?: TagsType[];
}

const props = defineProps<{ roomData: roomDataType }>();
const emits = defineEmits(['click', 'contextmenu']);

const domainInfo = useDomainInfoStore();
const { hotel } = storeToRefs(domainInfo);
const showCommentDialog = ref(false);
const commentText = ref('');

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const orderData = computed(() => props.roomData.order) as ComputedRef<OrderData>;
const microStayData = computed(() => orderData.value.microstay) as ComputedRef<OrderMicrostay>;

const checkOutDate: ComputedRef<string> = computed(() =>
  orderData.value ? dayjs(orderData.value.room.check_out).format('MM/DD') : '',
);

const unpaidRaw: ComputedRef<number> = computed(() => (orderData.value ? Number(orderData.value.unpaid_raw) : 0));

const calcStayDays = (sDate: string, eDate: string) => {
  const nTimestamp = dayjs().unix();
  const sTimestamp = dayjs(sDate, 'YYYY-MM-DD').unix();
  const eTimestamp = dayjs(eDate, 'YYYY-MM-DD').unix();

  const total = parseInt(`${(eTimestamp - sTimestamp) / 86400.0}`);
  let current = parseInt(`${(nTimestamp - sTimestamp) / 86400.0}`) + 1;

  if (current > total) {
    current = total;
  }

  return { total, current };
};

const orderDays = computed(() => {
  if (!orderData.value) return '';
  const { start_date: startDate, check_out: checkOut } = orderData.value.room;
  const { total, current } = calcStayDays(startDate, checkOut);
  return `${current}/${total}`;
});

const roomNumberStyle = computed(() => {
  const data = props.roomData.roomNo.split('');
  if (data.length === 5) return 'tw-text-base';
  if (data.length === 6) return 'tw-text-sm';
  if (data.length >= 7) return 'tw-text-xs';
  return 'tw-text-xl';
});

/** 取得訂單房間狀態
 * - upcoming：即將入住
 * - checkin：已入住
 * - checkout：已退房
 * - maintain：維修房
 */
const getOrderRoomStatus = (room: OrderRoom) => {
  if (!room) {
    return '';
  }

  if (room.booking_room_type === 'MAINTAIN') {
    return 'maintain';
  }

  const orderStatus = {
    UPCOMING: 'upcoming',
    CHECKED_IN: 'checkin',
    CHECKED_OUT: 'checkout',
  };

  const status = room.status as keyof typeof orderStatus;

  return orderStatus[status] || '';
};

const tags = computed(() => props.roomData.tags || []);

const maintainData = computed(() => {
  if (orderData.value && getOrderRoomStatus(orderData.value.room) === 'maintain') {
    return {
      ...orderData.value.room,
    };
  }
  return null;
});

const cardStatusClasses = computed(() => {
  const classes = [];

  /** @type {OrderDetail} */
  if (!orderData.value) {
    classes.push('no-order');
  }

  // 取得房間狀態
  if (orderData.value) {
    const status = getOrderRoomStatus(orderData.value.room);
    classes.push(status);
  }

  // 判斷是否為休息
  if (orderData.value && orderData.value.microstay) {
    classes.push('microstay');
  }

  // 卡片警告閃爍
  if (props.roomData.tags) {
    const hasErr = props.roomData.tags.find((tag) => {
      return tag.label.includes('超時未退');
    });
    if (hasErr) {
      classes.push('err');
    }
  }

  return classes;
});

const closeDialog = async () => {
  let confirm = true;
  if (commentText.value) {
    confirm = await (proxy as any).$confirm.show({ content: '是否放棄目前編輯的內容？', icon: 'warning' });
  }
  if (!confirm) return;
  showCommentDialog.value = false;
  commentText.value = '';
};

const saveComment = async () => {
  let confirm = true;
  if (commentText.value) {
    confirm = await (proxy as any).$confirm.show({ content: '確定保存目前編輯的內容？', icon: 'save' });
  }
  if (!confirm) {
    commentText.value = '';
    return;
  }
  showCommentDialog.value = false;
};

const openDetail = (data: roomDataType, e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  if (!props.roomData.visible) return;
  emits('click', props.roomData);
};

const openContextmenu = (data: roomDataType, e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  if (!props.roomData.visible) return;
  emits('contextmenu', props.roomData);
};

const tagOnRoomCard = computed(() => {
  const filterData = tags.value.filter((item) => item.label !== '已入住');
  if (filterData.length <= 7) return filterData;
  return filterData.slice(0, 7);
});
</script>

<template>
  <div
    class="tw-mx-[3px] tw-inline-block tw-min-h-[50px] tw-w-[200px] tw-overflow-hidden tw-rounded tw-bg-[#414141] tw-pb-3 tw-text-center tw-text-xs tw-text-white tw-transition-opacity tw-duration-[400ms]"
    :class="[{ 'tw-opacity-40': !orderData, 'tw-opacity-10': !roomData.visible }, ...cardStatusClasses]"
    @click="(e) => openDetail(roomData, e)"
    @contextmenu="(e) => openContextmenu(roomData, e)"
  >
    <div class="tw-flex">
      <div class="tw-flex tw-w-[80px] tw-items-center tw-pl-2">
        <q-icon
          v-if="orderData"
          name="cleaning_services"
          size="12px"
          class="tw-mr-1"
          :style="`color: ${orderData && orderData.room.clear ? '#797979' : '#FF3D3D'}`"
        />
        <div class="tw-font-bold" :class="roomNumberStyle">
          {{ roomData.roomNo || '' }}
        </div>
      </div>
      <div class="tw-flex tw-flex-1 tw-flex-col">
        <div
          class="status-color tw-tr tw-mb-1 tw-h-6 tw-truncate tw-px-1 tw-leading-6 tw-text-black"
          :title="orderData && roomData.name"
          :class="[orderData ? 'tw-bg-[#4EC1F4]' : 'tw-bg-[#b9b9b9]']"
        >
          {{ orderData && roomData.name }}
        </div>
        <div v-if="maintainData" class="tw-mr-2 tw-h-4 tw-text-right tw-font-bold">
          {{ maintainData.report }}
        </div>
        <div v-else class="tw-mr-2 tw-h-4 tw-text-right tw-font-bold">
          {{ orderData ? orderData.name : '' }}
        </div>
      </div>
    </div>
    <div class="tw-mx-2 tw-flex tw-h-4 tw-justify-between">
      <div v-if="checkOutDate" class="tw-ml-1 tw-flex tw-items-center">
        <template v-if="maintainData">
          <div></div>
        </template>
        <template v-else>
          <q-icon name="logout" size="8px" />
          <div v-if="microStayData" class="tw-ml-1">{{ dayjs(microStayData.est_check_out).format('MM/DD HH:mm') }}</div>
          <div v-else class="tw-ml-1">{{ checkOutDate }} {{ (hotel as any).check_out }}</div>
        </template>
      </div>
      <div>{{ unpaidRaw || '' }}</div>
    </div>
    <div class="tw-mt-2 tw-mb-1 tw-flex tw-h-[22px] tw-px-[6px]">
      <template v-for="(item, index) in tagOnRoomCard" :key="`tag-${index}`">
        <tooltip-btn
          v-if="!item.hide"
          :icon="item.icon"
          :tip="item.tip"
          :btn-size="22"
          :icon-size="9"
          :background-color="item.iconBg"
          hover-effect
          class="tw-mx-[2px]"
        />
      </template>
      <menu-hover v-if="tags.length > 7">
        <template #default="{ activatorAttr, menuAttr }">
          <div
            v-bind="activatorAttr"
            class="tw-flex tw-h-[22px] tw-w-[22px] tw-items-center tw-justify-center tw-rounded tw-bg-[#6F6F6F] tw-text-white"
          >
            {{ tags.length - 6 }}+
            <q-menu v-bind="menuAttr" anchor="top left" self="top left" :offset="[178, 0]">
              <div class="tw-flex tw-w-[206px] tw-flex-wrap tw-bg-[#414141] tw-px-3 tw-py-2 tw-text-black">
                <template v-for="(item, index) in tags" :key="`menu-tag-${index}`">
                  <tooltip-btn
                    :icon="item.icon"
                    :tip="item.tip"
                    :btn-size="22"
                    :icon-size="9"
                    :background-color="item.iconBg"
                    hover-effect
                    class="tw-mx-[2px] tw-mb-1"
                  />
                </template>
              </div>
            </q-menu>
          </div>
        </template>
      </menu-hover>
    </div>
    <div class="tw-mx-2 tw-flex tw-h-[18px] tw-items-center tw-justify-between">
      <div class="tw-h-full tw-flex-1 tw-truncate tw-rounded tw-text-left">
        <menu-hover>
          <template #default="{ activatorAttr, menuAttr }">
            <div v-bind="activatorAttr" class="tw-h-full">
              {{ orderData ? orderData.comment : '' }}
              <q-menu v-bind="menuAttr" anchor="top left" self="top left" :offset="[10, 0]">
                <div class="tw-w-[206px] tw-bg-[#eeeeee] tw-px-4 tw-py-2 tw-text-black">
                  <div class="tw-mb-1 tw-flex tw-justify-between tw-text-[#B6B6B6]">
                    <div>房間備註內容</div>
                    <div class="tw-inline-flex tw-cursor-pointer tw-items-center" @click="showCommentDialog = true">
                      <q-icon name="edit" />
                      <div class="tw-ml-1">edit</div>
                    </div>
                  </div>
                  <div v-if="orderData && orderData.comment">{{ orderData.comment || '' }}</div>
                  <div v-else class="tw-text-center tw-text-[#B6B6B6]">無內容 - 點擊新增內容</div>
                </div>
              </q-menu>
            </div>
          </template>
        </menu-hover>
      </div>
      <div class="tw-ml-3 tw-text-[#9d9d9d]">{{ orderDays }}</div>
    </div>
  </div>
  <q-dialog v-model="showCommentDialog" persistent>
    <q-card class="tw-w-[341px] tw-bg-[#eee] tw-text-black">
      <div class="border-bottom-line tw-px-5 tw-py-3">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-text-xl tw-font-medium">編輯房間備註內容</div>
          <div
            class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
            @click="closeDialog"
          >
            <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
          </div>
        </div>
        <div class="tw-text-[#6E6E6E]">{{ roomData.roomNo || '' }} {{ orderData ? roomData.name : '' }}</div>
      </div>
      <div class="border-bottom-line tw-relative tw-py-3 tw-px-4">
        <q-input
          v-model="commentText"
          bg-color="white"
          standout="bg-white text-black"
          input-class="tw-w-[305px] tw-h-[159px] tw-bg-[#fff] tw-text-[#6e6e6e]"
          type="textarea"
          class="comment-input"
          :autogrow="false"
          unelevated
        />
        <div class="tw-mt-3 tw-flex tw-justify-between">
          <q-btn class="tw-mr-1 tw-w-2/5 tw-bg-[#A4DAA6] tw-text-[#0D5F10]" label="取消" unelevated />
          <q-btn
            class="tw-flex-1 tw-bg-[#A4DAA6] tw-text-[#0D5F10]"
            :class="{ 'tw-grayscale': commentText.length === 0 }"
            label="儲存"
            unelevated
            :disable="commentText.length === 0"
          />
        </div>
        <!-- fot alpha -->
        <div class="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full tw-bg-white tw-text-center">
          目前會先顯示訂單備註內容<br />
          功能開發中，敬請期待
        </div>
      </div>
      <div class="tw-px-4 tw-py-3 tw-text-[#6E6E6E]">
        <div class="tw-mb-2 tw-text-[#B6B6B6]">最近三筆編輯紀錄</div>
        <template v-for="(item, index) in fakeCommentList" :key="`commnet-${index}`">
          <div :class="{ 'tw-mb-4': index + 1 < fakeCommentList.length }">
            <div>{{ item.date }} {{ `由${item.user}編輯` }}</div>
            <div>{{ item.comment }}</div>
          </div>
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
@keyframes blink {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    opacity: 0.5;
  }
}

.border-bottom-line {
  border-bottom: 1px solid #e0e0e0;
}

:deep(.comment-input) {
  .q-field__control {
    box-shadow: none;
    &::before {
      background: #fff;
    }
  }
  textarea {
    color: #6e6e6e !important;
  }
}

.upcoming {
  .status-color {
    background-color: #4ec1f4;
  }
}

.checkin {
  .status-color {
    background-color: #67db7e;
  }
}

.checkout {
  .status-color {
    background-color: #b9b9b9;
  }
}

.maintain {
  .status-color {
    background-color: #d194ff;
  }
}

.microstay {
  .status-color {
    background-color: #f4e34e;
  }
}

.err {
  position: relative;
  &::after {
    @apply tw-bg-red;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: blink 3s infinite;
    pointer-events: none;
  }
}
</style>
