import { EventBus } from "./eventBus";
import state from "./store/store";

export function notifySuccess(message) {
  notify(true, message);
}

export function notifyError(message) {
  notify(false, message);
}

function notify(status, message) {
  EventBus.$emit("notify", {
    status: status,
    message: message
  });
}

export function getUserAccounts() {
  let accounts = [];
  if (state.getters.numberOfAccounts !== 0) {
    for (const key in state.getters.getAccounts) {
      const account = state.getters.getAccounts[key];
      if (account && account.account && account.account.wallet !== "Issuer") {
        accounts.push(key);
      }
    }
  }
  return accounts;
}

export function getUserAccountsWithNames(exclude) {
  let accounts = [];
  const account = {
    accountId: "0.0.0",
    name: ""
  };
  accounts.push(account);

  if (state.getters.numberOfAccounts !== 0) {
    const accountList = state.getters.getAccounts;
    console.log("Account List:", accountList); // Debug log to check accounts list

    for (const key in accountList) {
      const acc = accountList[key];
      if (!acc || !acc.account) {
        console.warn(`Account for key ${key} is undefined or missing account details`);
        continue;
      }
      if (acc.account.wallet !== "Issuer" && acc.account.wallet !== exclude) {
        accounts.push({
          accountId: key,
          name: acc.account.wallet
        });
      }
    }
  }

  return accounts;
}

export function amountWithDecimals(amount, decimals) {
  return (amount / parseFloat(Math.pow(10, decimals))).toFixed(decimals);
}

export function getPrivateKeyForAccount(accountId) {
  const account = state.getters.getAccounts[accountId];
  if (account && account.account) {
    return account.account.privateKey;
  } else {
    console.warn(`Private key for account ${accountId} is undefined`);
    return "";
  }
}

export function getAccountDetails(account) {
  if (state.getters.numberOfAccounts !== 0) {
    const accounts = state.getters.getAccounts;
    console.log("Accounts:", accounts); // Debug log to check accounts

    for (const key in accounts) {
      const acc = accounts[key];
      if (!acc) {
        console.warn(`Account details for key ${key} are undefined`); // Warning for undefined account details
        continue;
      }
      const accountDetails = acc.account;
      if (!accountDetails) {
        console.warn(`Account details for key ${key} are undefined`); // Warning for undefined account details
        continue;
      }
      console.log(`Processing account: ${accountDetails.wallet}`);
      if (accountDetails.wallet === account) {
        return {
          accountId: key,
          privateKey: accountDetails.privateKey
        };
      }
    }
  }
  return {
    accountId: "",
    privateKey: ""
  };
}

export function secondsToParts(seconds) {
  const secondsInMonth = 30 * 24 * 60 * 60;
  const secondsInDay = 24 * 60 * 60;
  const secondsInHour = 60 * 60;

  const months = Math.floor(seconds / secondsInMonth);
  seconds %= secondsInMonth;
  const days = Math.floor(seconds / secondsInDay);
  seconds %= secondsInDay;
  const hours = Math.floor(seconds / secondsInHour);
  seconds %= secondsInHour;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let result = `${months} months `;
  if (days + hours + minutes + seconds !== 0) {
    result += `${days} days `;
    if (hours + minutes + seconds !== 0) {
      result += `${hours} hours `;
      if (minutes + seconds !== 0) {
        result += `${minutes} minutes `;
        if (seconds !== 0) {
          result += `${seconds} seconds `;
        }
      }
    }
  }
  return result;
}
