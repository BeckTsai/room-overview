<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { QDialog, useQuasar } from 'quasar';
import JsBarcode from 'jsbarcode';
import safeAwait from 'safe-await';
import dayjs from 'dayjs';

import { OrderData } from './order-detail-menu.vue';

import { getInvoiceInfo } from '../../composables/use-api-pms';
import { OrderInvoiceInfo } from '../../types/pms.type';

const $q = useQuasar();
const props = defineProps<{ orderData: OrderData }>();
const emits = defineEmits(['ok']);

const dialog = ref<InstanceType<typeof QDialog>>();
const show = ref(false);
const selected = ref<any>(null);
const printOptions = ref({
  reprint: false,
  itemDetail: true,
  saleDetail: true,
  remark: false,
});

const invoiceInfo = ref<OrderInvoiceInfo>();

const options = computed(() => {
  const invoices = props.orderData.invoices;
  if (!invoices || invoices.length === 0) {
    return [];
  }

  const options = invoices.map((invoice) => {
    const label = `${invoice.number}。${invoice.date} ${invoice.time}。金額：${invoice.amount}`;
    return {
      label,
      value: invoice,
    };
  });

  return options;
});

const title = computed(() => {
  if (printOptions.value.reprint) {
    return '電子發票證明聯補印';
  }

  return '電子發票證明聯';
});

const getInvoiceInfoData = async () => {
  const invoiceNum = selected.value.number;
  $q.loading.show();
  const [err, data] = await safeAwait(getInvoiceInfo(invoiceNum));
  $q.loading.hide();
  if (err) {
    $q.notify({
      type: 'negative',
      message: `讀取發票明細錯誤 : ${err}`,
    });
    return;
  }
  invoiceInfo.value = data as OrderInvoiceInfo;
};

const invoiceMonth = computed(() => {
  if (!invoiceInfo.value) {
    return '';
  }

  const mapMonth = {
    '01': '01-02月',
    '02': '01-02月',
    '03': '03-04月',
    '04': '03-04月',
    '05': '05-06月',
    '06': '05-06月',
    '07': '07-08月',
    '08': '07-08月',
    '09': '09-10月',
    '10': '09-10月',
    '11': '11-12月',
    '12': '11-12月',
  };
  const createDate = dayjs(invoiceInfo.value.IIS_Create_Date);
  const createMonth = createDate.format('MM') as keyof typeof mapMonth;
  const createYear = createDate.format('YYYY');

  const year = parseInt(createYear) - 1911;
  const month = mapMonth[createMonth];

  return `${year}年${month}`;
});

const paperInfo = computed(() => {
  if (!selected.value || !invoiceInfo.value) return null;
  const data = invoiceInfo.value as OrderInvoiceInfo;
  const number = `${data.IIS_Number.slice(0, 2)}-${data.IIS_Number.slice(2)}`;
  const seller = data.QRCode_Left.substr(45, 8);
  const buyer = data.IIS_Identifier === '0000000000' ? null : data.IIS_Identifier;
  const saleAmount = parseFloat(data.IIS_Sales_Amount) - parseFloat(data.IIS_Tax_Amount);

  const itemsName = data.ItemName.split('|');
  const itemsAmount = data.ItemAmount.split('|');
  const itemsCount = data.ItemCount.split('|');
  const itemsPrice = data.ItemPrice.split('|');
  const itemsWord = data.ItemWord.split('|');

  const items = itemsName.map((name, index) => {
    const amount = itemsAmount[index];
    const count = itemsCount[index];
    const price = itemsPrice[index];
    const word = itemsWord[index];

    return {
      name,
      amount,
      count,
      price,
      word,
    };
  });
  return {
    number,
    month: invoiceMonth.value,
    createDate: data.IIS_Create_Date,
    randomNum: data.IIS_Random_Number,
    seller,
    buyer,
    taxAmount: data.IIS_Tax_Amount,
    saleAmount,
    amount: data.IIS_Sales_Amount,
    customerName: data?.IIS_Customer_Name?.trim() ?? null,
    barcode: data.PosBarCode,
    qrcodeL: data.QRCode_Left,
    qrcodeR: data.QRCode_Right,
    items,
    remark: data.InvoiceRemark,
  };
});

const print = () => {
  // 取得列印內容
  const paperWrapper = document.querySelector('#paper-wrapper') as Element;
  const { innerHTML } = paperWrapper;

  // 取得列印樣式
  let stylesHtml = '';
  const stylesheet = document.querySelectorAll('link[rel="stylesheet"], style') as any;
  for (const node of [...stylesheet]) {
    stylesHtml += node.outerHTML;
  }

  const printWindow = window.open(
    '',
    '',
    'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0',
  ) as Window;
  printWindow.document.write(`<!DOCTYPE html><html><head>${stylesHtml}</head><body>${innerHTML}</body></html>`);
  printWindow.document.close(); // necessary for IE >= 10
  printWindow.focus(); // necessary for IE >= 10*/
  printWindow.print();

  // setTimeout(() => {
  //   printWindow.close();
  // }, 1000);

  return true;
};

watch(
  selected,
  () => {
    getInvoiceInfoData();
  },
  { deep: true },
);
watch(
  paperInfo,
  () => {
    if (paperInfo.value?.barcode) {
      nextTick(() => {
        JsBarcode('#invoice-barcode', `${paperInfo.value?.barcode}`, { height: 50, displayValue: false });
      });
    }
  },
  { deep: true },
);
</script>

<template>
  <q-dialog ref="dialog" v-model="show" no-backdrop-dismiss>
    <q-card
      v-if="orderData"
      class="tw-w-[400px] tw-overflow-hidden tw-bg-[#eee] tw-px-2 tw-pt-7 tw-text-xs tw-text-black"
    >
      <div class="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-px-4">
        <div class="tw-text-lg">訂單 {{ orderData.number }} 發票列印</div>
        <div
          class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
          @click="show = false"
        >
          <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
        </div>
      </div>
      <q-card-section>
        <q-select
          v-model="selected"
          :options="options"
          label="指定發票"
          class="tw-mb-3"
          outlined
          dense
          emit-value
          map-options
        />
        <q-item tag="label">
          <q-item-section>
            <q-item-label>是否為補印</q-item-label>
            <q-item-label caption>發票標題會加上「補印」</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle v-model="printOptions.reprint" />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>加入明細</q-item-label>
            <q-item-label caption>依序列出品項之「品名、數量、金額」</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle v-model="printOptions.itemDetail" />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>加入銷售明細</q-item-label>
            <q-item-label caption>列出「銷售額、稅額」</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle v-model="printOptions.saleDetail" />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>加入備註</q-item-label>
            <q-item-label caption>列印發票備註內容</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle v-model="printOptions.remark" />
          </q-item-section>
        </q-item>
        <div id="paper-wrapper" class="print-viewer">
          <div v-if="paperInfo" class="paper">
            <div class="tw-text-[22px] tw-font-bold">{{ title }}</div>
            <div class="tw-text-[22px] tw-font-bold">{{ paperInfo.month }}</div>
            <div class="tw-text-[22px] tw-font-bold">{{ paperInfo.number }}</div>
            <div>{{ paperInfo.createDate }}</div>
            <div class="flex">
              <div>隨機碼:{{ paperInfo.randomNum }}</div>
              <q-space />
              <div>總計:{{ paperInfo.amount }}</div>
            </div>
            <div class="flex">
              <div>賣方:{{ paperInfo.seller }}</div>
              <q-space />
              <div v-if="paperInfo.buyer"> 買方:{{ paperInfo.buyer }}</div>
            </div>
            <img id="invoice-barcode" class="tw-w-full" />
            <div class="tw-flex">
              <vue-qrcode :value="paperInfo.qrcodeL" class="!tw-h-auto !tw-w-1/2" :options="{ margin: 2 }" tag="img" />
              <vue-qrcode :value="paperInfo.qrcodeR" class="!tw-h-auto !tw-w-1/2" :options="{ margin: 2 }" tag="img" />
            </div>
            <template v-if="printOptions.itemDetail">
              <q-separator class="tw-mb-[5px] tw-text-sm tw-font-bold"> 交易明細 </q-separator>
              <div v-if="paperInfo.buyer" class="tw-flex">
                <div>買受人統編</div>
                <q-space />
                <div>{{ paperInfo.buyer }}</div>
              </div>
              <div v-if="paperInfo.customerName" class="tw-flex">
                <div>買受人名稱</div>
                <q-space />
                <div>{{ paperInfo.customerName }}</div>
              </div>
              <div class="tw-flex tw-font-bold">
                <div>品名/數量</div>
                <q-space />
                <div>金額</div>
              </div>
              <div v-for="item in paperInfo.items" :key="item.name" class="tw-flex">
                <div>{{ item.name }}/{{ item.count }}</div>
                <q-space />
                <div>{{ item.amount }}{{ item.word }}</div>
              </div>
            </template>

            <template v-if="printOptions.saleDetail">
              <q-separator class="tw-mb-[5px]" />
              <div class="tw-flex">
                <div>銷售額（應稅）</div>
                <q-space />
                <div>{{ paperInfo.saleAmount }}</div>
              </div>
              <div class="tw-flex">
                <div>稅額</div>
                <q-space />
                <div>{{ paperInfo.taxAmount }}</div>
              </div>
              <div class="tw-flex tw-font-bold">
                <div>總計</div>
                <q-space />
                <div>{{ paperInfo.amount }}</div>
              </div>
            </template>
            <template v-if="printOptions.remark">
              <q-separator class="tw-mb-[5px]" />
              <div class="tw-text-sm tw-font-bold">備註</div>
              <div class="tw-text-left tw-text-xs">{{ paperInfo.remark }}</div>
            </template>
          </div>
          <div v-else class="tw-border tw-border-black tw-py-2 tw-px-7 tw-text-3xl">請選擇指定發票</div>
        </div>
        <q-card-actions align="center">
          <q-btn class="tw-w-[100px]" color="green" unelevated @click="print">列印</q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
    <q-card v-else class="tw-w-[300px]">
      <q-card-section class="tw-flex tw-items-center tw-text-lg"> 內容異常，請重新開啟此視窗 </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
#paper-wrapper {
  &.print-viewer {
    min-width: 200px;
    max-height: 200px;
    padding: 10px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
    @screen 2xl {
      min-height: 300px;
      max-height: 40vh;
    }
  }
}

.paper {
  display: flex;
  width: 220px;
  font-size: 12px;
  flex-direction: column;
  justify-content: center;
  background: white;
  text-align: center;
  padding: 5px;
  box-shadow: 0px 5px 40px rgba(black, 0.3);
  & > div {
    margin-bottom: 2px;
    line-height: 1;
  }
  .q-separator {
    background: #000;
  }
}
</style>
