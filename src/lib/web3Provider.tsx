import { createAppKit } from '@reown/appkit/react';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { PROJECT_ID } from '@/constants/contracts';

const bscTestnet = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan Testnet',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
};

const metadata = {
  name: 'Avera Presale',
  description: 'Avera Token Presale Dashboard',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['/favicon.ico'],
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  networks: [bscTestnet as any],
  metadata,
  projectId: PROJECT_ID,
  features: {
    analytics: true,
  },
});

export { bscTestnet };
