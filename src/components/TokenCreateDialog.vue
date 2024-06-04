<template>
  <v-row justify="center" >
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
					<div class="image-container">
						<img src="../assets/ciplogo.png" alt="Impact Credits" width="100px" />
					</div>
          <v-card-title style="display: flex; justify-content: center; width: 100%;">
						Mint New Contracts or Currency
					</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    label="Token Name (Project)*"
                    :rules="nameRules"
                    v-model="name"
                    required
                  ></v-text-field>
                </v-col>
								<v-col cols="6">
                  <v-text-field
                    label="Symbol (UCID)*"
                    :rules="symbolRules"
                    v-model="symbol"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>

                <v-col cols="6">
                  <v-text-field
                    label="Transaction Fees (FPT)"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    label="Allocated Project Supply (APS)*"
                    required
                    v-model="initialSupply"
                    :rules="integerRules"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="adminKey" label="Enable Admin"></v-checkbox>
								</v-col>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="supplyKey" label="Change Supply"></v-checkbox>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="kycKey" label="Enable KYC"></v-checkbox>
								</v-col>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="wipeKey" label="Enable Wipe"></v-checkbox>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="freezeKey" label="Enable Freeze" @click="setFreeze"></v-checkbox>
								</v-col>
								<v-col cols="6" class="checkbox-row">
									<v-checkbox v-model="defaultFreezeStatus" :disabled="!freezeKey" label="Default"></v-checkbox>
								</v-col>
							</v-row>
            </v-container>
            <small>*indicates required field</small>
            <br />
            <small
              >Admin, KYC, Wipe and Freeze keys will default to a common key if
              set, they can however be set independently through the API</small
            >
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="create"
              :disabled="!valid"
            >
              Mint
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
      name: "Impact Credit	",
      symbol: "IPC",
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
      this.decimals = "0";
      this.initialSupply = "";
      this.name = "Impact Credit";
      this.symbol = "IPC";
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.checkbox-row {
  padding-top: 4px !important; /* Smaller top padding */
  padding-bottom: 4px !important; /* Smaller bottom padding */
}

.v-card-title {
  display: flex;
  justify-content: center;
  width: 100%;
}

.v-card {
  font-family: 'Nunito', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 8px;
}

.image-container {
  padding-top: 20px;
}

h3, ul, li, a {
  margin: 40px 0 0;
  list-style-type: none;
  padding: 0;
  display: inline-block;
  margin: 0 10px;
  color: #42b983;
}
</style>