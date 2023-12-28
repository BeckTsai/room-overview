<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { cloneDeep, constant } from 'lodash';
import { storeToRefs } from 'pinia';

import SearchBox from '../components/room-overview/search-box.vue';
import FilterBox from '../components/room-overview/filter-box.vue';
import AutoUpdate from '../components/room-overview/auto-update.vue';
import RoomCard from '../components/room-overview/room-card.vue';
import OrderDetailMenu from '../components/room-overview/order-detail-menu.vue';
import contextmenu from '../components/room-overview/contextmenu.vue';
import maintainMenu from '../components/room-overview/maintain-menu.vue';

import { useDomainInfoStore } from '../stores/domainInfo.store';
import { str2RegexStr } from '../modules/utils';
import { calcCommonTags, getPriorityOrderFromOrderDetail } from '../modules/order.utils';
import { OrderData } from '../types/pms.type';

interface SearchType {
  placeHolder: string;
  type: string;
  searchKey: string[];
  icon: string;
  tip: string;
  name: string;
}

const $q = useQuasar();
const domainInfo = useDomainInfoStore();
const { orders, hotel } = storeToRefs(domainInfo);
const { setDomainInfo, setOrders } = domainInfo;
const currentSearchType = ref<SearchType>({} as SearchType);
const searchValue = ref('');
const showNoMatchingDialog = ref(false);
const showOrderDetail = ref(false);
const showContextmenu = ref(false);
const currentOrderDetail = ref<object | null>(null);
const currentRoomData = ref<object | null>(null);
const filterLabels = ref<string[]>([]);

const searchTypeList = [
  {
    placeHolder: '搜尋訂單編號',
    type: 'orderNum',
    searchKey: ['number', 'platform_number'],
    icon: 'pin',
    tip: '大師、OTA 皆可，不分大小寫',
    name: '訂單號',
  },
  {
    placeHolder: '搜尋房號',
    type: 'roomNo',
    searchKey: ['roomNo'],
    icon: 'room',
    tip: '輸入房號',
    name: '房號',
  },
  {
    placeHolder: '搜尋個人資料',
    type: 'info',
    searchKey: ['name', 'phone', 'email'],
    icon: 'account_box',
    tip: '姓名、電話、Mail',
    name: '個人資料',
  },
  {
    placeHolder: '搜尋備註',
    type: 'comment',
    searchKey: ['comment'],
    icon: 'article',
    tip: '輸入備註相關內容',
    name: '備註',
  },
];

const roomNumberList = computed(() => domainInfo.getRoomNumberList);

const mapOrdersFromRoom = computed(() => {
  const orderRoomData = orders.value.reduce((prev: any, curr: any) => {
    const rooms = curr.rooms.map((room: object) => {
      const cloneData = cloneDeep(curr);
      delete cloneData.rooms;
      return { room, ...cloneData };
    });
    return [...prev, ...rooms];
  }, []);
  return getPriorityOrderFromOrderDetail(orderRoomData as OrderData[], hotel.value);
});

const roomCardData = computed(() => {
  const data: Array<object> = [];
  roomNumberList.value.forEach((el: any) => {
    const order = (mapOrdersFromRoom.value as any).find((item: any) => item.room.number === el.roomNo);
    if (order) {
      data.push({ ...el, order, visible: true, tags: calcCommonTags(order, hotel) });
    } else {
      data.push({ ...el, visible: true });
    }
  });
  return data;
});

const filterRoomCardData = computed(() => {
  const { type, searchKey } = currentSearchType.value;
  const searchRegex = new RegExp(str2RegexStr(searchValue.value), 'i');
  if ((!type || !searchValue.value) && filterLabels.value.length === 0) return roomCardData.value;

  let filterSearchData = [];
  if (!type || !searchValue.value) {
    filterSearchData = roomCardData.value;
  } else {
    if (type === 'roomNo') {
      filterSearchData = (roomCardData.value as Array<object>).map((datum: any) => {
        const isMatch = searchKey.every((item: any) => searchRegex.test(datum[`${item}`]) === true);
        return { ...datum, visible: isMatch };
      });
    } else {
      filterSearchData = (roomCardData.value as Array<object>).map((datum: any) => {
        let isMatch = true;
        const order = datum.order;
        if (!order) {
          isMatch = false;
        } else {
          isMatch = searchKey.some((item: any) => {
            let value = '';
            if (typeof datum.order[`${item}`] === 'string') {
              value = datum.order[`${item}`].toLowerCase();
            } else {
              value = datum.order[`${item}`];
            }
            return searchRegex.test(value) === true;
          });
        }
        return { ...datum, visible: isMatch };
      });
    }
  }
  if (filterLabels.value.length === 0) {
    return filterSearchData;
  } else {
    let filterLabelData = [];

    filterLabelData = filterSearchData.map((datum: any) => {
      if (datum.visible) {
        let isMatch = true;
        if (!datum.order) {
          isMatch = false;
        } else if (datum.tags) {
          isMatch = filterLabels.value.every((label) => datum.tags.some((tag: any) => label.includes(tag.label)));
          // isMatch = datum.tags.some((tag: any) => filterLabels.value.includes(tag.label)); //之後會將checkbox 更換 radio
        }

        return { ...datum, visible: isMatch };
      } else {
        return datum;
      }
    });

    return filterLabelData;
  }
});

const hasSearchResults = computed(() => {
  if (!searchValue.value) true;
  return filterRoomCardData.value.some((item) => !!item.visible);
});

watch(hasSearchResults, (value) => {
  if (!value) {
    showNoMatchingDialog.value = true;
  } else {
    showNoMatchingDialog.value = false;
  }
});

watch(
  filterRoomCardData,
  (value) => {
    if (!currentOrderDetail.value || !value) return;
    const newData = value.find(
      (item) => item.order && item.order.room.id === (currentOrderDetail.value as any).room.id,
    );
    if (newData) {
      currentOrderDetail.value = newData.order;
    }
  },
  { deep: true },
);

const handleDialogBtn = () => {
  currentSearchType.value = {
    placeHolder: '',
    type: '',
    searchKey: [],
    icon: '',
    tip: '',
    name: '',
  };
  searchValue.value = '';
  showNoMatchingDialog.value = false;
  filterLabels.value = [];
};

const init = async (): Promise<void> => {
  $q.loading.show();
  try {
    await setDomainInfo();
    await setOrders();
  } catch (e) {
    console.log(e);
  } finally {
    $q.loading.hide();
  }
};

const closeOrderDetail = () => {
  console.log(222);
  showOrderDetail.value = false;
  currentOrderDetail.value = null;
  currentRoomData.value = null;
  showContextmenu.value = false;
};

const openOrderDetail = (data: any) => {
  if (data.order && data.order.room.booking_room_type === 'MAINTAIN') {
    $q.dialog({ component: maintainMenu, componentProps: { orderData: data.order } });
  } else if (data.order) {
    closeOrderDetail();
    setTimeout(() => {
      currentOrderDetail.value = data.order;
      showOrderDetail.value = true;
    }, 100);
  } else {
    closeOrderDetail();
  }
};

const onContextmenu = (data: any) => {
  closeOrderDetail();
  setTimeout(() => {
    currentRoomData.value = data;
    showContextmenu.value = true;
  }, 100);
};

init();
</script>

<template>
  <!-- header -->
  <div class="tw-mb-[10px] tw-flex tw-justify-center">
    <search-box
      v-model:inputValue="searchValue"
      v-model:currentSearchType="currentSearchType"
      :btn-types="searchTypeList"
    />
    <div class="tw-ml-5 tw-mr-px tw-flex tw-items-center tw-rounded-sm tw-bg-[#c4c4c4] tw-px-[29px]">
      <filter-box v-model:filterLabels="filterLabels" />
    </div>
    <auto-update :update="setOrders" />
  </div>
  <div v-if="filterRoomCardData" class="content-wrapper" @click="closeOrderDetail">
    <template v-for="(item, index) in filterRoomCardData" :key="`room-card-${index}`">
      <room-card :room-data="item" @click="openOrderDetail" @contextmenu="onContextmenu" />
    </template>
    <order-detail-menu v-model:show="showOrderDetail" :order-data="currentOrderDetail" />
    <contextmenu v-model:show="showContextmenu" :room-data="currentRoomData" />
  </div>
  <q-popup-proxy
    v-model="showNoMatchingDialog"
    no-parent-event
    no-focus
    persistent
    anchor="bottom middle"
    self="top middle"
    class="tw-overflow-visible"
  >
    <div class="tw-mt-[90px] tw-inline-flex tw-items-center !tw-rounded tw-bg-[#f44336] tw-p-8">
      <div class="tw-mr-[30px] tw-text-xl">找不到任何匹配項目</div>
      <q-btn color="primary" @click="handleDialogBtn">清除篩選</q-btn>
    </div>
  </q-popup-proxy>
</template>

<style lang="scss" scoped>
.content-wrapper {
  width: 98%;
  height: 80%;
  overflow-y: auto;
  margin: 0 auto;
}
</style>
