import { createStore } from 'vuex';
import auth from './modules/auth';
import employee from './modules/employee';

export default createStore({
  modules: {
    auth,
    employee,
  },
});
