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
    <div class="title">Impact Credit Transfer Service</div>

    <v-spacer></v-spacer>

    <div class="button-group">
      <v-btn rounded :color="issuerButtonColor" @click="showUI('Issuer')">
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
        :color="aliceButtonColor"
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
        :color="bobButtonColor"
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
      <!-- <v-btn icon @click="showCompose()">
        <v-icon>mdi-music</v-icon>
      </v-btn> -->
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
    showCompose() {
      EventBus.$emit("tokenCompose", "");
    },
    showCreate() {
      EventBus.$emit("tokenCreate", "");
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
  background-color: transparent; /* Make header transparent */
  box-shadow: none !important; /* Optional: remove shadow if desired */
  color: white; /* Ensuring text is visible */
	font-family: "Nunito", sans-serif;
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
  align-items: center;
	padding-right: 5px;
}

.icon-link {
  margin-left: 10px;
}

.icon-group {
  display: flex;
  align-items: center;
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
	padding-right: 5px;
}
</style>