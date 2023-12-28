<script setup lang="ts">
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import Camera from 'simple-vue-camera';
import safeAwait from 'safe-await';
import { useQuasar } from 'quasar';
import { uploadOrderFiles } from '../../composables/use-api-pms';
import { blobToBase64, base64ToBlob } from '../../modules/utils';
import { OrderData } from './order-detail-menu.vue';

const props = defineProps<{ orderData: OrderData }>();
const emits = defineEmits(['ok']);

interface CameraOptionsType {
  label: string;
  value: string;
}

const $q = useQuasar();
const webcam = ref<InstanceType<typeof Camera>>();
const cameraOptions = ref<CameraOptionsType[]>([]);
const currentDeviceID = ref<string | any>('');
const loading = ref(false);
const show = ref(false);
const snapshotImg = ref<any>('');

watch(show, (nv) => {
  if (nv) {
    nextTick(() => {
      webcam.value?.devices(['videoinput']).then((devices) => {
        cameraOptions.value = devices.map((device) => {
          return { label: device.label, value: device.deviceId };
        });
      });
    });
  }
});

const changeDeviceId = (data: string) => {
  webcam.value?.changeCamera(data);
};

const onLoading = () => {
  loading.value = true;
};

const isLoaded = () => {
  loading.value = false;
  currentDeviceID.value = webcam.value?.currentDeviceID() || '';
};

const cameraStatusMsg = computed(() => {
  if (!currentDeviceID.value) {
    return '請選擇 WebCam';
  }
  if (cameraOptions.value.length === 0) {
    return '偵測不到任何 WebCam';
  }
  if (loading.value) {
    return '相機載入中';
  }
  return '';
});

const capture = async () => {
  try {
    const blob: Blob | any = await webcam.value?.snapshot({ width: 640, height: 480 }, 'image/png');
    snapshotImg.value = await blobToBase64(blob);
  } catch (e) {
    console.log(`snapshot error ${e}`);
  }
};

const cancelCapture = () => (snapshotImg.value = '');

const upload = async () => {
  if (!snapshotImg.value) return;
  const params = {
    booking_number: props.orderData.number,
    type: 1,
    image: base64ToBlob(snapshotImg.value),
  };
  $q.loading.show();
  const [err, res] = await safeAwait(uploadOrderFiles(params));
  $q.loading.hide();
  snapshotImg.value = '';
  emits('ok');
  if (err) {
    $q.notify({
      type: 'negative',
      message: `上傳證件失敗 : ${(err as any)?.response?.data?.message}`,
    });
    console.error(`[ upload ] err : `, { ...err });
    return;
  }

  $q.notify({
    type: 'positive',
    message: `上傳證件成功`,
  });
  console.log(`[ upload ] res : `, res);
};
</script>

<template>
  <q-dialog v-model="show" no-backdrop-dismiss>
    <q-card class="tw-w-[700px] !tw-max-w-[initial] tw-overflow-hidden tw-bg-[#eee] tw-p-4 tw-text-xs tw-text-black">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-my-2 tw-ml-9 tw-text-lg">{{ orderData.number }} Webcam - 證件照</div>
        <div
          class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
          @click="show = false"
        >
          <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
        </div>
      </div>
      <q-select
        v-model="currentDeviceID"
        :options="cameraOptions"
        label="指定 Webcam 來源"
        class="tw-mb-3"
        outlined
        dense
        emit-value
        map-options
        @update:model-value="changeDeviceId"
      />
      <div class="tw-relative tw-min-h-[500px] tw-w-full tw-bg-black tw-text-white">
        <Camera
          ref="webcam"
          :resolution="{ width: 640, height: 480 }"
          autoplay
          @started="isLoaded"
          @loading="onLoading"
        />
        <div
          v-if="cameraStatusMsg"
          class="tw-absolute tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-text-xl"
        >
          {{ cameraStatusMsg }}
        </div>
        <img
          v-show="snapshotImg"
          class="tw-absolute tw-left-1/2 tw-top-1/2 tw-w-full -tw-translate-x-1/2 -tw-translate-y-1/2"
          :src="snapshotImg"
        />
      </div>
      <div class="tw-mt-5 tw-flex tw-items-center tw-justify-center">
        <q-btn
          v-if="!snapshotImg"
          class="tw-mr-7 tw-w-44"
          color="green"
          text-color="white"
          label="擷取影像"
          @click="capture"
        />
        <q-btn v-else class="tw-mr-7 tw-w-44" color="green" text-color="white" label="重拍" @click="cancelCapture" />
        <q-btn
          class="tw-w-44"
          :color="snapshotImg ? 'green' : 'grey'"
          text-color="white"
          label="上傳"
          :disable="!snapshotImg"
          @click="upload"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
