import { createApp, h } from 'vue';
import Confirm from './Confirm.vue';

const ConfirmPlugin = {};
let $vm: any;

const initInstance = () => {
  const app = createApp(Confirm);
  const container = document.createElement('div');
  $vm = app.mount(container);
  const rootElem = document.querySelector('#app') as Element;
  rootElem.appendChild(container);
};

(ConfirmPlugin as any).install = function (app: any) {
  const confirm = {
    show(options: any) {
      return new Promise((resolve) => {
        if (!$vm) {
          initInstance();
        }
        $vm.open({
          ...options,
          resolve,
        });
      });
    },
  };
  app.config.globalProperties.$confirm = confirm;
};

export default ConfirmPlugin;
