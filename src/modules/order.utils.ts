import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { cloneDeep } from 'lodash';
import { Order, OrderRoom } from '../types/pms.type';

dayjs.extend(isBetween);

export interface OrderData extends Order {
  room: OrderRoom;
}
// 計算一般住房 Tag
export const calcCommonTags = (order: any, domainConfig: any) => {
  const tags = [];

  if (order) {
    // // 判斷是否為續住
    const nowTimeObj = dayjs();
    const today = dayjs().format('YYYY-MM-DD');
    const nTimestamp = dayjs(today, 'YYYY-MM-DD').unix();
    const eTimestamp = dayjs(order.check_out, 'YYYY-MM-DD').unix();

    // 今日退房
    if (nTimestamp === eTimestamp) {
      tags.push({
        icon: 'logout',
        iconBg: '#FF5858',
        tip: '今天就該退房的訂單',
        label: '今日應退',
        hide: false,
      });
    }

    // 是否為休息
    if (order.microstay) {
      tags.push({
        icon: 'local_cafe',
        iconBg: '#4fc3f7',
        tip: `${order.microstay.plan}`,
        label: '休息',
        hide: false,
      });
    }

    // 是否為即將入住
    if (order.room.status === 'UPCOMING') {
      tags.push({
        icon: 'local_cafe',
        iconBg: '#4fc3f7',
        tip: '即將入住',
        label: '即將入住',
        hide: true,
      });
    }

    // 是否為已退房
    if (order.room.status === 'CHECKED_OUT' && order.room.booking_room_type !== 'MAINTAIN') {
      tags.push({
        icon: 'local_cafe',
        iconBg: '#4fc3f7',
        tip: '已退房',
        label: '已退房',
        hide: true,
      });
    }

    // 判斷超時未退（忽略維修房）
    if (order.room.booking_room_type !== 'MAINTAIN') {
      let checkoutTimeObj = null;

      // 休息與一般入住退房時間不一樣
      if (order.microstay) {
        checkoutTimeObj = dayjs(order.microstay.est_check_out);
      } else {
        const checkoutDateTime = `${order.room.check_out} ${domainConfig.check_out}`;
        checkoutTimeObj = dayjs(checkoutDateTime);
      }

      if (nowTimeObj.isAfter(checkoutTimeObj)) {
        tags.push({
          icon: 'close',
          iconBg: '#FF5858',
          tip: '超時未退',
          label: '超時未退',
          hide: false,
        });
      }
    }

    // 是否為已入住
    if (order.room.status === 'CHECKED_IN') {
      tags.push({
        icon: 'local_cafe',
        iconBg: '#4fc3f7',
        tip: '已入住',
        label: '已入住',
        hide: true,
      });
    }

    // 是否為停賣房
    if (order.room.booking_room_type === 'MAINTAIN') {
      tags.push({
        icon: 'local_cafe',
        iconBg: '#4fc3f7',
        tip: '停賣房',
        label: '停賣房',
        hide: true,
      });
    }

    // 未結清款項
    if (order?.unpaid_raw) {
      const unpaid = parseFloat(order.unpaid_raw);
      if (unpaid !== 0) {
        tags.push({
          icon: 'paid',
          iconBg: '#FF5858',
          tip: `未付金額：${unpaid}`,
          label: '未結清款項',
          hide: false,
        });
      }
    }
    // 判斷發票未開
    if (order.invoice && order.invoices?.length === 0) {
      tags.push({
        icon: 'receipt',
        iconBg: '#FF5858',
        tip: `發票未開`,
        label: '發票未開',
        hide: false,
      });
    }

    // 從訂單備註判斷
    if (order.comment) {
      const comment = order.comment;

      // 是否為加休
      if (comment.match('加休')) {
        tags.push({
          icon: 'more_time',
          iconBg: '#546e7a',
          tip: '加休',
          label: '加休',
          hide: false,
        });
      }

      // 是否為加訂續住
      if (comment.match('加訂續住')) {
        tags.push({
          icon: 'more_time',
          iconBg: '#546e7a',
          tip: `加訂續住`,
          label: '加訂續住',
          hide: false,
        });
      }

      // 澡盆
      if (comment.match('澡盆')) {
        tags.push({
          icon: 'hot_tub',
          iconBg: '#ff4081',
          tip: `澡盆`,
          label: '澡盆',
          hide: false,
        });
      }

      // 消毒鍋
      if (comment.match('消毒鍋')) {
        tags.push({
          icon: 'bug_report',
          iconBg: '#ff4081',
          tip: `消毒鍋`,
          label: '消毒鍋',
          hide: false,
        });
      }

      // 加人
      if (comment.match('加人')) {
        tags.push({
          icon: 'person_add',
          iconBg: '#546e7a',
          tip: `加人`,
          label: '加人',
          hide: false,
        });
      }

      // 加床
      if (comment.match('加床')) {
        tags.push({
          icon: 'single_bed',
          iconBg: '#546e7a',
          tip: `加床`,
          label: '加床',
          hide: false,
        });
      }

      // 拆床
      if (comment.match('拆床')) {
        tags.push({
          icon: 'swap_horiz',
          iconBg: '#546e7a',
          tip: `拆床`,
          label: '拆床',
          hide: false,
        });
      }
    }
  }

  return tags;
};

/** 取得優先顯示訂單
 */
export const getPriorityOrderFromOrderDetail = (ordersDetail: OrderData[], domainConfig: any) => {
  if (ordersDetail.length === 0) return [];
  const today = dayjs().format('YYYY-MM-DD');
  const nTimestamp = dayjs(today, 'YYYY-MM-DD').unix();

  /** 根據權重判斷
   * https://www.notion.so/funcointeam/d23feedfda7a4ff6a61b0c5509ddb7ea#4eb66f89031e4c558c78ef104ed64f05
   */

  // 1. 過濾出有效時間內的訂單（加入時分 HH:mm）
  const validOrdersDetail = ordersDetail.filter((order: any) => {
    if (order.microstay) {
      const { microstay } = order;
      const nowTimeObj = dayjs();
      const checkoutTimeObj = dayjs(microstay.est_check_out);
      if (microstay.check_out) {
        return !nowTimeObj.isAfter(checkoutTimeObj);
      }
      return true;
    } else {
      const { room } = order;
      if (room.status === 'CHECKED_OUT' && room.booking_room_type !== 'MAINTAIN') {
        const findData = ordersDetail.find(
          (item) =>
            item.room.number === room.number &&
            item.room.start_date === today &&
            (item.room.status === 'UPCOMING' || item.room.status === 'CHECKED_IN'),
        );
        if (findData) return false;
      }

      const startDate = room.start_date;
      const endDate = room.check_out;

      const startDateTime = `${startDate} 00:00`;
      const endDateTime = `${endDate} ${domainConfig.check_in}`;

      const inTime = dayjs().isBetween(startDateTime, endDateTime, 'minute', '[]');
      return inTime;
    }
  });

  const cloneData = cloneDeep(validOrdersDetail);

  // 2. 今日應退，但狀態還是「已入住」

  ordersDetail.forEach((order) => {
    const { room } = order;
    const eTimestamp = dayjs(room.check_out, 'YYYY-MM-DD').unix();

    if (nTimestamp === eTimestamp && room.status === 'CHECKED_IN') {
      const index = cloneData.findIndex((item: any) => {
        const checkInTime = dayjs(item.room.check_out, 'YYYY-MM-DD').unix();
        return checkInTime === nTimestamp;
      });
      cloneData.splice(index, 1, order);
    }
  });
  return cloneData;
};
