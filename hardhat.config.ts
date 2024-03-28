/* eslint-disable import/no-extraneous-dependencies */
import '@nomiclabs/hardhat-ethers'
import 'dotenv/config'
import 'hardhat-deploy'
import { HardhatUserConfig } from 'hardhat/config'
import { resolve } from 'path'

const ensContractsPath = './node_modules/@ensdomains/ens-contracts'

console.log(resolve(ensContractsPath, 'artifacts'))

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'mxc_geneva',
  networks: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mxc_geneva: {
      chainId: 5167004,
      tags: ['use_root'],
      accounts: {
        mnemonic: process.env.SECRET_WORDS!,
      },
      url: 'https://geneva-rpc.moonchain.com',
    },
    hardhat: {
      saveDeployments: false,
      chainId: 1337,
      accounts: {
        mnemonic: process.env.SECRET_WORDS!,
      },
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    localhost: {
      saveDeployments: false,
      url: 'http://localhost:8545',
      chainId: 1337,
      accounts: {
        mnemonic: process.env.SECRET_WORDS!,
      },
      live: false,
      tags: ['test', 'legacy', 'use_root'],
    },
  },
  // namedAccounts: {
  //   deployer: {
  //     default: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //   },
  // },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
    },
    owner2: {
      default: 2,
    },
  },
  external: {
    contracts: [
      {
        artifacts: [
          resolve(ensContractsPath, 'artifacts'),
          resolve(ensContractsPath, './deployments/archive'),
        ],
        deploy: resolve(ensContractsPath, './build/deploy'),
      },
    ],
  },
}

export default config
