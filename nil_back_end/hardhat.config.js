// hardhat.config.js
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@typechain/hardhat");
require("dotenv").config();

// Load environment variables
const NIL_TESTNET_URL = process.env.NIL_TESTNET_URL || "https://testnet.nil.foundation";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    nil_testnet: {
      url: NIL_TESTNET_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 60000, // 1 minute timeout
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
    }
  },
  typechain: {
    outDir: "types/contracts",
    target: "ethers-v5"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};