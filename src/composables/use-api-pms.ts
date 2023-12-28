import $pms from '../modules/request';
import { getNowTime, objectToFormData } from '../modules/utils';

export const getOrders = () => {
  return $pms.get('/ci/bookings', {
    params: {
      start_date: getNowTime(),
      include_maintained: 1,
    },
  });
};

export const getOrder = (bookingNumber: string) => {
  return $pms.get('/ci/booking', {
    params: {
      booking_number: bookingNumber,
    },
  });
};

export const getDomainInfo = () => {
  return $pms.get('/ci/hotel');
};

export const getOrderFiles = (bookingNumber: string) => {
  return $pms.get('/ci/files', {
    params: { booking_number: bookingNumber },
  });
};

export const uploadOrderFiles = (data: any) => {
  const formData = objectToFormData(data);
  return $pms.post('/ci/files', formData);
};

export const getInvoiceInfo = (invoiceNumber: string | number) => {
  return $pms.get('/ci/invoice/info', {
    params: { invoice_number: invoiceNumber },
  });
};

export const postRoomStatus = (params: any, data: any) => {
  return $pms.post('/ci/room_status', null, {
    params: { ...params, ...data },
  });
};
