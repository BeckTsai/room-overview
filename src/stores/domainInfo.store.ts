import { defineStore } from 'pinia';
import safeAwait from 'safe-await';
import { getDomainInfo, getOrders } from '../composables/use-api-pms';
import cloneDeep from 'lodash/cloneDeep';
import { parseQuery } from '../modules/utils';

const domainList = ['Goldenvistahotel', 'checkinnexpressntts', 'partner'];

const domain = domainList.includes(parseQuery('domain')) ? parseQuery('domain') : '';

const hasBlock = (string: string) => {
  return string.includes('(') || string.includes(')');
};

interface State {
  facilities: object;
  hotel: object;
  roomTypes: Array<object>;
  imgs: Array<object>;
  logo: string;
  orders: Array<object>;
  domain: string;
}

export const useDomainInfoStore = defineStore('domainInfo', {
  state: (): State => ({
    facilities: {},
    hotel: {},
    roomTypes: [],
    imgs: [],
    logo: '',
    orders: [],
    domain,
  }),
  getters: {
    getRoomNumberList(state) {
      const list = state.roomTypes.reduce((acc: Array<string>, cur: any) => {
        const roomInfoList = cur.room_no.map((item: string) => {
          const cloneCur = cloneDeep(cur);
          delete cloneCur.room_no;
          return { roomNo: item, ...cloneCur };
        });
        return [...acc, ...roomInfoList];
      }, []);
      const numberGroup: any = [];
      const othersGroup: any = [];
      list.forEach((item: any) => {
        if (hasBlock(item.roomNo)) {
          othersGroup.push(item);
        } else {
          numberGroup.push(item);
        }
      });
      const sortingNumberGroup = numberGroup.sort((a: any, b: any) => Number(a.roomNo) - Number(b.roomNo));
      const sortingOthersGroup = othersGroup.sort((a: any, b: any) => {
        const aRoomNo = a.roomNo.split('').splice(0, 1).splice(-1, 1).join();
        const bRoomNo = b.roomNo.split('').splice(0, 1).splice(-1, 1).join();
        return Number(aRoomNo) - Number(bRoomNo);
      });

      return [...sortingNumberGroup, ...sortingOthersGroup];
    },
  },
  actions: {
    async setDomainInfo() {
      const [, data] = await safeAwait(getDomainInfo());
      const domainInfo: any = data;
      this.facilities = domainInfo.facilities;
      this.hotel = domainInfo.hotel;
      this.roomTypes = domainInfo.roomTypes;
      this.imgs = domainInfo.imgs;
      this.logo = domainInfo.logo;
    },
    async setOrders() {
      const [, data] = await safeAwait(getOrders());
      const orders: any = data;
      this.orders = orders;
    },
  },
});
