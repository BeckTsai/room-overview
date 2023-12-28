<script setup lang="ts">
import { ref } from 'vue';
import { QUploader, useQuasar } from 'quasar';
import { uploadOrderFiles } from '../../composables/use-api-pms';
import { OrderData } from './order-detail-menu.vue';

const props = defineProps<{ orderData: OrderData }>();
const emits = defineEmits(['ok']);

const $q = useQuasar();
const loading = ref(false);
const show = ref(false);
const filesList = ref<File[]>([]);
const uploader = ref<InstanceType<typeof QUploader>>();

const pickFiles = () => uploader.value?.pickFiles();

const updateFiles = (files: readonly any[]) => {
  files.forEach((item) => {
    filesList.value.push(item);
  });
};

const removeFiles = (files: readonly any[]) => {
  files.forEach((item) => {
    const index = filesList.value.findIndex((file: any) => file.name === item.name);
    if (index >= 0) filesList.value.splice(index, 1);
  });
};

const uploadFile = (file: File) => {
  const params = {
    booking_number: props.orderData.number,
    type: 1,
    image: file,
  };
  return uploadOrderFiles(params);
};

const submitUploadFiles = async () => {
  const promises: any[] = [];
  filesList.value.forEach((item: File) => {
    promises.push(uploadFile(item));
  });
  $q.loading.show();
  try {
    await Promise.all(promises);
    $q.notify({
      type: 'positive',
      message: `證件上傳完成`,
    });
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: `上傳失敗 : ${(e as any)?.response?.data?.message}`,
    });
  } finally {
    filesList.value = [];
    uploader.value?.reset();
    $q.loading.hide();
    emits('ok');
  }
};
</script>

<template>
  <q-dialog v-model="show" no-backdrop-dismiss>
    <q-card class="tw-w-[430px] tw-overflow-hidden tw-bg-[#eee] tw-p-4 tw-text-xs tw-text-black">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-my-2 tw-ml-9 tw-text-lg">訂單 {{ orderData.number }} 上傳證件照</div>
        <div
          class="tw-flex tw-h-5 tw-w-5 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-bg-[#FF5858]"
          @click="show = false"
        >
          <q-icon name="close" :style="{ color: '#eee' }"></q-icon>
        </div>
      </div>
      <q-uploader
        ref="uploader"
        class="tw-w-full"
        color="green"
        multiple
        hide-upload-btn
        accept="image/*"
        @added="updateFiles"
        @removed="removeFiles"
      />
      <div class="tw-mt-5 tw-flex tw-items-center tw-justify-center">
        <q-btn class="tw-mr-7 tw-w-44" color="green" text-color="white" label="選擇檔案" @click="pickFiles" />
        <q-btn class="tw-w-44" color="green" text-color="white" label="上傳" @click="submitUploadFiles" />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss"></style>
