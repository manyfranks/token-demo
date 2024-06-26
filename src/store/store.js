import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import { accountCreate } from "../service/accountCreate";
import { accountGetInfo } from "../service/accountGetInfo";
import { tokenGetInfo } from "../service/tokenService";
import { notifySuccess, notifyError } from "../utils";
import { EventBus } from "../eventBus";

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    tokens: {},
    accounts: {},
    bids: {},
    currentTokenId: undefined,
    enablePoll: false
  },
  mutations: {
    setPolling(state, polling) {
      state.enablePoll = polling;
    },
    setCurrentTokenId(state, tokenId) {
      state.currentTokenId = tokenId;
    },
    setTokens(state, tokens) {
      console.log("Setting tokens:", tokens); // Debug log
      state.tokens = tokens;
    },
    setAccounts(state, accounts) {
      console.log("Setting accounts:", accounts); // Debug log
      state.accounts = accounts;
    },
    setAccount(state, account) {
      console.log("Setting account:", account); // Debug log
      Vue.set(state.accounts, account.accountId, account);
    },
    setToken(state, token) {
      console.log("Setting token:", token); // Debug log
      Vue.set(state.tokens, token.tokenId, token);
    },
    addBid(state, bid) {
      Vue.set(state.bids, bid.tokenId, bid);
    },
    deleteBid(state, bid) {
      Vue.delete(state.bids, bid.tokenId);
    },
    reset(state) {
      state.accounts = {};
      state.tokens = {};
      state.bids = {};
      state.currentTokenId = undefined;
    },
    wipeAccount(state, wipeInstruction) {
      const accountId = wipeInstruction.accountId;
      const tokenId = wipeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          state.accounts[accountId].tokenRelationships[tokenId].balance = 0;
        }
      }
    },
    freezeAccount(state, freezeInstruction) {
      const accountId = freezeInstruction.accountId;
      const tokenId = freezeInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          const freeze = freezeInstruction.freeze ? 1 : 2;
          account.tokenRelationships[tokenId].freezeStatus = freeze;
          Vue.set(state.accounts, accountId, account);
        }
      }
    },
    kycAccount(state, kycInstruction) {
      const accountId = kycInstruction.accountId;
      const tokenId = kycInstruction.tokenId;
      const account = state.accounts[accountId];

      if (typeof account !== "undefined") {
        const relationship = account.tokenRelationships[tokenId];
        if (typeof relationship !== "undefined") {
          const kyc = kycInstruction.kyc ? 1 : 2;
          state.accounts[accountId].tokenRelationships[tokenId].kycStatus = kyc;
        }
      }
    }
  },
  getters: {
    getBids(state) {
      if (typeof state.bids === "undefined") {
        return {};
      } else {
        return state.bids;
      }
    },
    currentTokenId(state) {
      return state.currentTokenId;
    },
    numberOfTokens(state) {
      return Object.keys(state.tokens).length || 0;
    },
    numberOfAccounts(state) {
      return Object.keys(state.accounts).length || 0;
    },
    getTokens(state) {
      if (typeof state.tokens === "undefined") {
        return {};
      } else {
        return state.tokens;
      }
    },
    getAccounts(state) {
      if (typeof state.accounts === "undefined") {
        return {};
      } else {
        return state.accounts;
      }
    }
  },
  actions: {
    async setup({ commit, state }) {
      if (Object.keys(state.accounts).length === 0) {
        try {
          // set ourselves up
          // create issuer account
          let newAccount = await accountCreate("Issuer");
          console.log("Created account:", newAccount); // Debug log
          commit("setAccount", newAccount);
          notifySuccess("Setting up demo 1/4 - Treasury account created");

          // create user 1
          newAccount = await accountCreate("Alice");
          console.log("Created account:", newAccount); // Debug log
          commit("setAccount", newAccount);
          notifySuccess("Setting up demo 2/4 - PO wallet account created");

          // create user 2
          newAccount = await accountCreate("Bob");
          console.log("Created account:", newAccount); // Debug log
          commit("setAccount", newAccount);
          notifySuccess("Setting up demo 3/4 - MB wallet account created");

          // create user 3
          newAccount = await accountCreate("Marketplace");
          console.log("Created account:", newAccount); // Debug log
          commit("setAccount", newAccount);
          notifySuccess("Setting up demo 4/4 - NCX wallet account created");
        } catch (err) {
          notifyError("Error during setup: " + err.message);
          console.error(err);
        }
      }
      commit("setCurrentTokenId", undefined);
      notifySuccess("Demo Ready");
      commit("setPolling", true);
      EventBus.$emit("busy", false);
    },
    async fetchAccounts({ commit, state }) {
      if (typeof state.accounts === "undefined" || Object.keys(state.accounts).length === 0) {
        return;
      }
      for (const key in state.accounts) {
        if (!state.enablePoll) {
          return;
        }
        try {
          let account = state.accounts[key];
          const accountDetails = await accountGetInfo(key);
          account.tokenRelationships = accountDetails;
          commit("setAccount", account);
        } catch (err) {
          notifyError("Error fetching account info for " + key + ": " + err.message);
          console.error(err);
        }
      }
    },
    async fetchTokens({ commit, state }) {
      if (typeof state.tokens === "undefined" || Object.keys(state.tokens).length === 0) {
        return;
      }
      for (const key in state.tokens) {
        if (!state.enablePoll) {
          return;
        }
        try {
          const token = state.tokens[key];
          const tokenUpdate = await tokenGetInfo(token);
          commit("setToken", tokenUpdate);
        } catch (err) {
          notifyError("Error fetching token info for " + key + ": " + err.message);
          console.error(err);
        }
      }
    },
    async fetch({ dispatch, state }) {
      if (!state.enablePoll) {
        return;
      }
      await dispatch("fetchAccounts");
      await dispatch("fetchTokens");
    }
  },
  modules: {}
});
