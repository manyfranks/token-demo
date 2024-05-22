<template>
  <div class="dashboard">
    <v-overlay :value="busy">
      <v-progress-circular
        v-if="busy"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </v-overlay>

    <div v-if="showUI === 'Issuer'" class="issuer-view">
      <div v-if="currentTokenId"><Accounts /></div>
      <div v-else><Tokens /></div>
    </div>

    <div v-else class="wallet-view">
      <Wallet v-bind:walletInstance="showUI" :key="walletKey" />
    </div>

    <TokenDetailsDialog />
    <TokenCreateDialog />
    <MintBurnDialog />
    <TransferDialog />
    <ComposerDialog />
    <TransactionsDrawer />
    <ErrorNoEnvFilePopup />

    <v-footer :color="footerColor" absolute class="font-weight-medium" padless>
      <v-card flat tile width="100%" :class="footerColor">
        <v-card-text :class="textColor">
          <strong>{{ message }}</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </div>
</template>

<script>
import Tokens from "../components/Tokens";
import Accounts from "../components/Accounts";
import Wallet from "../components/Wallet";
import { EventBus } from "../eventBus";
import TokenDetailsDialog from "../components/TokenDetailsDialog";
import MintBurnDialog from "../components/MintBurnDialog";
import TokenCreateDialog from "../components/TokenCreateDialog";
import TransferDialog from "../components/TransferDialog";
import TransactionsDrawer from "@/components/TransactionsDrawer";
import ComposerDialog from "../components/ComposerDialog";
import ErrorNoEnvFilePopup from "@/components/ErrorNoEnvFilePopup";

let timer;

export default {
  name: "Dashboard",
  components: {
    ErrorNoEnvFilePopup,
    TransactionsDrawer,
    ComposerDialog,
    TransferDialog,
    MintBurnDialog,
    TokenDetailsDialog,
    TokenCreateDialog,
    Tokens,
    Accounts,
    Wallet
  },
  computed: {
    currentTokenId() {
      return this.$store.getters.currentTokenId;
    }
  },
  data: function() {
    return {
      message: "",
      footerColor: "success",
      textColor: "white--text",
      busy: false,
      showUI: "Issuer",
      walletKey: 0
    };
  },
  created() {
    EventBus.$on("busy", busy => {
      this.busy = busy;
    });
    EventBus.$on("viewChange", ui => {
      this.showUI = ui;
      this.walletKey += 1;
    });

    EventBus.$on("notify", notification => {
      this.message = notification.message;
      if (notification.status) {
        this.footerColor = "green darken-2 text-center";
        this.textColor = "white--text";
      } else {
        this.footerColor = "orange darken-2 text-center";
        this.textColor = "black--text";
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.message = "";
        this.footerColor = "primary";
      }, 5000);
    });
  }
};
</script>

<style scoped>
:root {
  --primary-color: #4caf50;
  --secondary-color: #ffc107;
  --text-color: #333;
  --font-family: "Nunito", sans-serif;
}

.dashboard {
  font-family: var(--font-family);
  background-color: rgba(32, 37, 50, 0.4); /* Adjust alpha for greater transparency */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px; /* Rounded corners for the entire dashboard */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Optional: adds shadow for a "lifted" effect */
  backdrop-filter: blur(10px); /* Applies a blur effect on anything behind the dashboard */
	border: 3px solid #e302ab;
}

.issuer-view,
.wallet-view {
  flex: 1;
  padding: 20px;
}

.v-footer {
  background-color: var(--primary-color);
  color: white;
}

.v-footer .v-card-text {
  text-align: center;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: var(--primary-color);
}
</style>
