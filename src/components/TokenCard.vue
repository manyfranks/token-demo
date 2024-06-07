<template>
  <v-card class="custom-glow">
    <v-toolbar flat dense color="transparent">
      <v-toolbar-title class="white--text">{{ token.name }} ({{ token.symbol }})</v-toolbar-title>
      <v-spacer></v-spacer>
			<v-btn small class="newly-issued-button">NEWLY ISSUED</v-btn>
    </v-toolbar>
    <v-card-text>
      <v-row>
        <v-col cols="6">Blockchain Address:</v-col>
        <v-col cols="6">
          <a :href="tokenMirrorURL" target="_blank">{{ token.tokenId }}</a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Smart Contract Data:</v-col>
        <v-col cols="6">
          <a href="https://etherscan.io/address/0xddBca2B2038209946f4D624da2ae2AdfB06A7dc0#code" target="_blank">View On Etherscan</a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Token Symbol:</v-col>
        <v-col cols="6">{{ token.symbol }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Fees Adjusted:</v-col>
        <v-col cols="6">0.50%</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Total Tokens Issued:</v-col>
        <v-col cols="6">{{ token.totalSupply }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="6">Current USD Equivalent:</v-col>
        <v-col cols="6">${{ token.totalSupply }}.00</v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
			<v-btn class="update" icon @click="showAccounts">
        <v-icon>mdi-account-multiple</v-icon>
      </v-btn>
      <v-btn icon class="mint" @click="mintToken">
        <v-icon>mdi-plus-circle-multiple-outline</v-icon>
      </v-btn>
      <v-btn icon class="transfer" @click="transferToken">
        <v-icon>mdi-shopping-outline</v-icon>
      </v-btn>
      <v-btn icon class="delete" @click="deleteToken">
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { EventBus } from "../eventBus";
import { amountWithDecimals, tokenDelete } from "../utils";

export default {
  name: "TokenCard",
  props: {
    tokenId: String
  },
  data: function() {
    return {
      token: {},
      dirty: false,
      isDeleted: false,
      defaultFreezeStatus: false,
      mirrorURL: "https://dragonglass.me/hedera/search?q=",
      tokenMirrorURL: "",
      fileMirrorURL: "",
      totalSupply: 0.0,
      interval: undefined
    };
  },
  created() {
    this.token = this.$store.getters.getTokens[this.tokenId];
    this.tokenMirrorURL = this.mirrorURL.concat(this.tokenId);
    this.totalSupply = amountWithDecimals(this.token.totalSupply, this.token.decimals);
    this.interval = setInterval(() => {
      this.token = this.$store.getters.getTokens[this.tokenId];
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
	methods: {
    mintToken() {
      const mint = {
        operation: "mint",
        tokenId: this.tokenId
      };
      EventBus.$emit("mintBurnDialog", mint);
    },
    burnToken() {
      const burn = {
        operation: "burn",
        tokenId: this.tokenId
      };
      EventBus.$emit("mintBurnDialog", burn);
    },
    transferToken() {
      const transfer = {
        operation: "transfer",
        tokenId: this.tokenId,
        isNFT: this.token.isNFT,
        user: "Issuer",
        name: this.token.name
      };
      EventBus.$emit("transferDialog", transfer);
    },
    showDetails() {
      EventBus.$emit("tokenDetails", this.token);
    },
    showAccounts() {
      this.$store.commit("setCurrentTokenId", this.tokenId);
    },
    updateToken() {
      EventBus.$emit("busy", true);
      //TODO: Update auto renew properties
      //TODO: Update token name
      //TODO: Update token symbol
      //TODO: Update treasury
      //TODO: Update autoRenewAccount
      //TODO: Update autoRenewPeriod
      //TODO: Update expiry
      // const tokenUpdate = {
      //   tokenId: this.tokenId,
      //   name: this.token.name,
      //   symbol: this.token.symbol,
      //   treasury: this.token.treasury,
      //   autoRenewAccount: this.token.autoRenewAccount,
      //   autoRenewPeriod: this.token.autoRenewPeriod,
      //   expiry: this.token.expiry
      // };
      EventBus.$emit("busy", false);
    },
    async deleteToken() {
      EventBus.$emit("busy", true);
      await tokenDelete(this.token);
      EventBus.$emit("busy", false);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

.v-card.custom-glow {
  font-family: 'Nunito', sans-serif;
  background-color: #ffffff; /* Ensures the background is white */
  color: whitesmoke; /* Ensures text color is high contrast */
  border: 1px solid #E302AB; /* Pink border as specified */
  border-radius: 5px; /* Maintains rounded corners */
  min-width: 400px; /* Minimum width for the card */
  box-shadow: 0 0 20px 1px #E302AB !important; /* Stronger glow for visibility */
}

.v-toolbar {
    background-color: #1A1A1A !important; /* Slightly lighter than the card background for subtle contrast */
    color: #ffffff !important;
}

.v-btn {
    color: #4A90E2; /* Blue color for buttons to stand out */
}

.v-icon {
    color: #4A90E2; /* Matching icons with button colors */
}

.details, .mint, .burn, .transfer, .update, .delete {
    background-color: #262626 !important; /* Dark backgrounds for buttons */
    border-radius: 4px; /* Slightly rounded for a modern touch */
}

.v-card-text, .v-card-actions {
    padding: 16px; /* Adequate padding for content spacing */
    color: #ffffff !important;
}

.details {
  color: #ffffff !important; /* White for visibility */
}

.mint {
  color: #a4de02 !important; /* Green for mint actions */
}

.burn {
  color: #ff1744 !important; /* Red for burn actions */
}

.transfer {
  color: #29b6f6 !important; /* Light blue for transfer actions */
}

.update {
  color: #edd600 !important; /* Yellow for update actions */
}

.delete {
  color: #dd2c00 !important; /* Deep orange for delete actions */
}

.newly-issued-button {
    margin-right: 8px; /* Spacing between the button and the title */
    border: 2px solid #5FC1D7; /* Blue border to match icon colors */
    color: #5FC1D7; /* Text color */
    border-radius: 4px; /* Rounded corners for the button */
    background-color: transparent !important;
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
  color: #42b983;
}
</style>
