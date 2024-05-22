<template>
  <v-app-bar app color="transparent" dark absolute>
    <div class="d-flex align-center">
      <v-img
        alt="Hedera Logo"
        class="shrink mr-2 logo"
        contain
        src="../assets/download.png"
        transition="scale-transition"
        width="40"
      />
    </div>
    <div class="title">NCX Central Reserve</div>

    <v-spacer></v-spacer>

    <div class="button-group">
      <v-btn rounded :class="issuerGradient" @click="showUI('Issuer')">
        Central Treasury ({{ walletIssuer }})
      </v-btn>
      <a
        class="icon-link"
        :href="'https://hashscan.io/' + network + '/account/' + walletIssuer"
        target="_blank"
      >
        <v-icon>mdi-open-in-new</v-icon>
      </a>
    </div>

    <div v-if="numberOfAccounts !== 0" class="button-group ma-2">
      <v-btn
        rounded
        :class="aliceGradient"
        :disabled="numberOfTokens === 0"
        @click="showUI('Alice')"
      >
        Alice (Owner) ({{ walletId1 }})
      </v-btn>
      <a
        class="icon-link"
        :href="'https://hashscan.io/' + network + '/account/' + walletId1"
        target="_blank"
      >
        <v-icon>mdi-open-in-new</v-icon>
      </a>

      <v-btn
        rounded
        :class="bobGradient"
        :disabled="numberOfTokens === 0"
        @click="showUI('Bob')"
      >
        Bob (Buyer) ({{ walletId2 }})
      </v-btn>
      <a
        class="icon-link"
        :href="'https://hashscan.io/' + network + '/account/' + walletId2"
        target="_blank"
      >
        <v-icon>mdi-open-in-new</v-icon>
      </a>
    </div>

    <v-spacer></v-spacer>

    <div class="icon-group">
      <v-btn icon @click="showCreate()">
        <v-icon>mdi-new-box</v-icon>
      </v-btn>
      <v-btn icon @click="showTransactions()">
        <v-icon>mdi-abacus</v-icon>
      </v-btn>
      <v-btn icon class="ml-6" color="white" @click="nuke()">
        <v-icon>mdi-nuke</v-icon>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { getAccountDetails, notifySuccess } from "../utils";
import { EventBus } from "../eventBus";

export default {
  name: "Header",
  data() {
    return {
      numberOfAccounts: this.$store.getters.numberOfAccounts,
      numberOfTokens: this.$store.getters.numberOfTokens,
      walletId2: "",
      walletId1: "",
      walletIssuer: "",
      interval: undefined,
      issuerButtonColor: "success",
      aliceButtonColor: "primary",
      bobButtonColor: "primary",
      network: process.env.VUE_APP_NETWORK
    };
  },
  computed: {
    issuerGradient() {
      return this.issuerButtonColor === 'success' ? 'gradient-success' : 'gradient-primary';
    },
    aliceGradient() {
      return this.aliceButtonColor === 'success' ? 'gradient-success' : 'gradient-primary';
    },
    bobGradient() {
      return this.bobButtonColor === 'success' ? 'gradient-success' : 'gradient-primary';
    },
  },
  created() {
    this.interval = setInterval(() => {
      this.getWalletIds();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    getWalletIds() {
      this.numberOfAccounts = this.$store.getters.numberOfAccounts;
      this.numberOfTokens = this.$store.getters.numberOfTokens;

      if (this.numberOfAccounts === 4) {
        this.walletId1 = getAccountDetails("Alice").accountId;
        this.walletId2 = getAccountDetails("Bob").accountId;
        this.walletIssuer = getAccountDetails("Issuer").accountId;
      }
    },
    showUI(ui) {
      switch (ui) {
        case "Issuer":
          this.issuerButtonColor = "success";
          this.aliceButtonColor = "primary";
          this.bobButtonColor = "primary";
          break;
        case "Alice":
          this.issuerButtonColor = "primary";
          this.aliceButtonColor = "success";
          this.bobButtonColor = "primary";
          break;
        case "Bob":
          this.issuerButtonColor = "primary";
          this.aliceButtonColor = "primary";
          this.bobButtonColor = "success";
          break;
      }

      EventBus.$emit("viewChange", ui);
    },
    showTransactions() {
      EventBus.$emit("showTransactions", "");
    },
    nuke() {
      this.$store.commit("setPolling", false);
      EventBus.$emit("busy", true);
      EventBus.$emit("nuke", "");

      notifySuccess("Clearing demo. Please wait");
      setTimeout(() => {
        this.$store.commit("reset");
        this.$store.dispatch("setup");
        EventBus.$emit("viewChange", "Issuer");
      }, 3000);
    }
  }
};
</script>

<style scoped>
.v-app-bar {
  background-color: transparent;
  box-shadow: none;
  color: white;
  font-family: "Nunito", sans-serif;
}

.gradient-success {
  background: linear-gradient(to bottom right, #E10044 0%, #E10044 5.21%, #E302AB 100%);
  color: white;
}

.gradient-primary {
  background: linear-gradient(to bottom right, #000000 0%, #202532 5.21%, #434343 100%);
  color: white;
}

.logo {
  margin-right: 10px;
}

.title {
  font-size: 1.2rem;
  font-weight: 500;
}

.button-group {
  display: flex;
  align-items:center;
}

.icon-link {
  margin-left: 10px;
}

.icon-group {
  display: flex;
  align-items: center;
}
</style>