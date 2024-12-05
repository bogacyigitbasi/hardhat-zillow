// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.17",
//   allowUnlimitedContractSize: true
// };
require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-ethers");
// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan"); // Verify contracts on Etherscan
// require("hardhat-gas-reporter"); // Report gas usage
require("solidity-coverage"); // Test coverage for Solidity
require("dotenv").config(); // Load environment variables

// Load environment variables from a .env file
const { API_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.13", // Specify Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for deployment cost
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337, // Local development network
      allowUnlimitedContractSize: true,
      // throwOnTransactionFailures: false,
      // throwOnCallFailures: false,
      // timeout: 1800000
    }
   /* The `goerli` and `mainnet` network configurations in the Hardhat configuration file are
   specifying the network settings for the Goerli test network and the Ethereum mainnet
   respectively. */
    // goerli: {
    //   url: API_URL, // Infura or Alchemy URL from .env
    //   accounts: [`0x${PRIVATE_KEY}`], // Private key for deployment
    // },
    // mainnet: {
    //   url: API_URL, // Infura or Alchemy URL for mainnet
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, // API key for verifying contracts on Etherscan
  },
  // gasReporter: {
  //   enabled: true, // Enable gas reporting
  //   currency: "USD", // Display gas costs in USD
  //   gasPrice: 21, // Set a custom gas price in Gwei
  // },
};
