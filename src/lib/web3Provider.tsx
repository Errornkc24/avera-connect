import { createAppKit } from '@reown/appkit/react';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { PROJECT_ID } from '@/constants/contracts';

const bscTestnet = {
  id: 'eip155:97',
  chainId: 97,
  name: 'BNB Smart Chain Testnet',
  currency: 'tBNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  chainNamespace: 'eip155' as const,
};

const metadata = {
  name: 'Avera Presale',
  description: 'Avera Token Presale Dashboard',
  url: window.location.origin,
  icons: ['/favicon.ico'],
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  networks: [bscTestnet],
  metadata,
  projectId: PROJECT_ID,
  features: {
    analytics: true,
  },
});

export { bscTestnet };
