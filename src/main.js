import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

void store.dispatch("setup").then(() => {
  console.log("Setup complete");
  void store.dispatch("fetch").then(() => {
    console.log("Fetch complete");
  }).catch(error => {
    console.error("Error during fetch:", error);
  });
}).catch(error => {
  console.error("Error during setup:", error);
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
