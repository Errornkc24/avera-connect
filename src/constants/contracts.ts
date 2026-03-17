export const PROJECT_ID = '2d7ded4b2b1becfe9064b344d8c4ba63';

export const CONTRACTS = {
  AVERA_PRESALE: '0x30cBB192e2e1A832eE11e0F7195e7Ba94dE40Cd6',
  AVERA_TOKEN: '0x2f180e77d99Dd5a94e3B997f174559108Ac9B509',
  USDT: '0xB268fAc05e02Ee31Cd1d5BCF2BbEBF3dA1DF4520',
} as const;

export const DECIMALS = {
  AVERA: 18,
  USDT: 6,
} as const;

export const PRESALE_ABI = [
  // User write
  'function buyPresaleTokens(uint256 usdtAmount, address referrer) external',
  'function buyPublicSaleTokens(uint256 usdtAmount) external',
  'function claimPresaleTokens(uint256 index) external',
  'function claimRewardToken(uint256 index) external',

  // Admin write
  'function startPresale(uint256 index, uint256 startTimestamp, uint256 endTimestamp) external',
  'function pausePresale() external',
  'function continuePresale() external',
  'function closePresale() external',
  'function startPublicSale() external',
  'function pausePublicSale() external',
  'function updatePresalePrice(uint256 round, uint256 newPrice) external',
  'function updatePresaleTime(uint256 round, uint256 startTime, uint256 endTime) external',
  'function updatePublicSalePrice(uint256 newPrice) external',
  'function changeRecipient(address payable newRecipient) external',
  'function changeMinPurchase(uint256 amount) external',
  'function changeMaxPurchase(uint256 amount) external',
  'function changeAVERAToken(address newToken) external',
  'function changeUSDTToken(address newToken) external',
  'function recoverTokens(uint256 amount, address to) external',
  'function recoverUSDTTokens(uint256 amount, address to) external',
  'function transferTokenomicsAllocation(address recipient, uint256 amount, uint256 allocationIndex) external',

  // View
  'function owner() view returns (address)',
  'function activePresaleRound() view returns (uint256)',
  'function minPurchase() view returns (uint256)',
  'function maxPurchase() view returns (uint256)',
  'function publicSalePrice() view returns (uint256)',
  'function totalRewardUSDT() view returns (uint256)',
  'function getPresaleInfo() view returns (uint256 currentRound, uint256 currentPrice, uint256 totalSold, uint256 endTime, bool isActive)',
  'function getPublicSaleInfo() view returns (uint256 price, uint256 totalSold, uint256 totalAllocation, bool isActive)',
  'function getAllPresaleRounds() view returns (tuple(string name, uint256 totalTokens, uint256 suppliedTokens, uint256 price, uint256 startTime, uint256 endTime, uint256 stakingRewardBP, uint256 cliffTime, uint8 active)[7])',
  'function getAllTokenomicsAllocations() view returns (tuple(string name, uint256 totalTokens, uint256 suppliedTokens)[8])',
  'function getRecipient() view returns (address)',
  'function getUserPresaleVesting(address user, uint256 offset, uint256 limit) view returns (tuple(address beneficiary, uint256 totalTokens, uint256 remainingTokens, uint256 USDTAmount, uint256 startTime, uint256 cliffEnd, uint256 vestingEnd, uint256 lastClaimTime, uint256 releaseInterval, uint256 releasePercentBP, uint256 roundIndex, string roundName, bool active)[] data, uint256 total)',
  'function getUserStakingRewards(address user, uint256 offset, uint256 limit) view returns (tuple(address beneficiary, uint256 rewardTokens, uint256 remainingTokens, uint256 monthlyReward, string roundName, uint256 startTime, uint256 endTime, uint256 lastClaimTime, uint256 releaseInterval, bool active)[] data, uint256 total)',
  'function getPublicSalePurchasesByBuyer(address buyer, uint256 offset, uint256 limit) view returns (tuple(address buyer, uint256 usdtAmount, uint256 tokenAmount, uint256 purchaseTime)[] data, uint256 total)',
  'function getAllPrivateSaleData(uint256 offset, uint256 limit) view returns (tuple(address beneficiary, uint256 totalTokens, uint256 remainingTokens, uint256 USDTAmount, uint256 startTime, uint256 cliffEnd, uint256 vestingEnd, uint256 lastClaimTime, uint256 releaseInterval, uint256 releasePercentBP, uint256 roundIndex, string roundName, bool active)[] data, uint256 total)',
  'function getAllStakingReward(uint256 offset, uint256 limit) view returns (tuple(address beneficiary, uint256 rewardTokens, uint256 remainingTokens, uint256 monthlyReward, string roundName, uint256 startTime, uint256 endTime, uint256 lastClaimTime, uint256 releaseInterval, bool active)[] data, uint256 total)',
  'function getAllPublicSaleData(uint256 offset, uint256 limit) view returns (tuple(address buyer, uint256 usdtAmount, uint256 tokenAmount, uint256 purchaseTime)[] data, uint256 total)',
  'function getTokenomicsTransfers(uint256 offset, uint256 limit) view returns (tuple(address recipient, uint256 amount, uint256 transferTime, string category, uint256 allocationIndex)[] data, uint256 total)',
  'function getTokenomicsTransfersByCategory(uint256 allocationIndex) view returns (tuple(address recipient, uint256 amount, uint256 transferTime, string category, uint256 allocationIndex)[])',
  'function getReferralsByReferrer(address referrer, uint256 offset, uint256 limit) view returns (tuple(address referrer, address buyer, uint256 usdtAmount, uint256 rewardAmount, uint256 timestamp, string roundName)[] data, uint256 total)',
  'function getAllReferrals(uint256 offset, uint256 limit) view returns (tuple(address referrer, address buyer, uint256 usdtAmount, uint256 rewardAmount, uint256 timestamp, string roundName)[] data, uint256 total)',
  'function getReferralRewardPercent() view returns (uint256)',
];

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];
