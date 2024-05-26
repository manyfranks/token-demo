<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-card-title class="headline">
            Generate New Impact Credits
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Unique ID*"
                    :rules="nameRules"
                    v-model="name"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    label="Symbol*"
                    :rules="symbolRules"
                    v-model="symbol"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Whole or Decimal*"
                    required
                    v-model="decimals"
                    :rules="decimalsRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Amount*"
                    required
                    v-model="initialSupply"
                    :rules="integerRules"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                    v-model="adminKey"
                    label="Enable Admin"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="supplyKey"
                    label="Change Supply"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox v-model="kycKey" label="Enable KYC"></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="wipeKey"
                    label="Enable Wipe"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                    v-model="freezeKey"
                    label="Enable Freeze"
                    @click="setFreeze"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    v-model="defaultFreezeStatus"
                    :disabled="!freezeKey"
                    label="Default"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
            <br />
            <small>
              Central Treasury, KYC, Wipe, and Freeze keys will default to a common key if
              set. They can, however, be set independently through the API.
            </small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn color="primary" text @click="create" :disabled="!valid">
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
import { EventBus } from "../eventBus";
import { tokenCreate } from "../service/tokenService";
import { PrivateKey } from "@hashgraph/sdk";
import { getAccountDetails } from "../utils";

export default {
  name: "TokenCreateDialog",
  data: function() {
    return {
      valid: false,
      dialog: false,
      decimals: 0,
      initialSupply: 0,
      name: "",
      symbol: "",
      defaultFreezeStatus: false,
      adminKey: true,
      wipeKey: true,
      freezeKey: true,
      kycKey: true,
      supplyKey: true,
      integerRules: [
        v =>
          (v == parseInt(v) && v >= 0) ||
          "Integer greater or equal to 0 required"
      ],
      decimalsRules: [
        v =>
          (v == parseInt(v) && v >= 0) ||
          "Integer greater or equal to 0 required"
      ],
      nameRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
      ],
      symbolRules: [
        v => !!v || "Input required",
        v => v.length <= 100 || "Max length 100"
        // v => /^[a-zA-Z]*$/.test(v) || "Only letters are allowed"
      ]
    };
  },
  created() {
    EventBus.$on("tokenCreate", () => {
      this.valid = false;
      this.decimals = "";
      this.initialSupply = "";
      this.name = "";
      this.symbol = "";
      this.defaultFreezeStatus = false;
      this.adminKey = true;
      this.wipeKey = true;
      this.freezeKey = true;
      this.kycKey = true;
      this.supplyKey = true;
      this.dialog = true;
    });
  },
  methods: {
    setFreeze() {
      if (this.freezeKey === false) {
        this.defaultFreezeStatus = false;
      }
    },
    async create() {
      EventBus.$emit("busy", true);
      const privateKey = await PrivateKey.generate();
      let _defaultFreezeStatus = false;
      if (this.freezeKey) {
        if (this.defaultFreezeStatus) {
          _defaultFreezeStatus = true;
        } else {
          _defaultFreezeStatus = false;
        }
      }

      const issuerAccount = getAccountDetails("Issuer");
      const token = {
        name: this.name,
        symbol: this.symbol,
        decimals: this.decimals,
        initialSupply: this.initialSupply,
        adminKey: this.adminKey ? privateKey.toString() : undefined,
        kycKey: this.kycKey ? privateKey.toString() : undefined,
        freezeKey: this.freezeKey ? privateKey.toString() : undefined,
        wipeKey: this.wipeKey ? privateKey.toString() : undefined,
        supplyKey: this.supplyKey ? privateKey.toString() : undefined,
        defaultFreezeStatus: _defaultFreezeStatus,
        autoRenewAccount: issuerAccount.accountId,
        treasury: issuerAccount.accountId,
        deleted: false,
        key: privateKey.toString()
      };
      const newToken = await tokenCreate(token);
      if (typeof newToken.tokenId !== "undefined") {
        this.$store.commit("setToken", newToken);
        this.dialog = false;
      }
      EventBus.$emit("busy", false);
    }
  }
};
</script>

<style scoped>
:root {
  --primary-color: #4caf50;
  --secondary-color: #ffc107;
  --background-color: #f5f5f5;
  --text-color: #333;
  --font-family: "Nunito", sans-serif;
}

.headline {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.v-card {
  background-color: white;
  color: var(--text-color);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  border-bottom: 1px solid #e0e0e0;
}

.v-card-text {
  padding: 20px;
}

.v-card-actions {
  border-top: 1px solid #e0e0e0;
  padding: 10px 20px;
}

small {
  color: #757575;
}

.v-btn {
  margin-left: 10px;
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
