import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import { CONTRACTS, PRESALE_ABI, ERC20_ABI, DECIMALS } from '@/constants/contracts';
import type { BrowserProvider } from 'ethers';

export function usePresaleContract() {
  const { walletProvider } = useAppKitProvider('eip155');
  const { address, isConnected } = useAppKitAccount();
  const [loading, setLoading] = useState(false);

  const getProvider = useCallback(() => {
    if (!walletProvider) throw new Error('Wallet not connected');
    return new ethers.providers.Web3Provider(walletProvider as any);
  }, [walletProvider]);

  const getPresaleContract = useCallback((signed = false) => {
    const provider = getProvider();
    const signerOrProvider = signed ? provider.getSigner() : provider;
    return new ethers.Contract(CONTRACTS.AVERA_PRESALE, PRESALE_ABI, signerOrProvider);
  }, [getProvider]);

  const getUsdtContract = useCallback((signed = false) => {
    const provider = getProvider();
    const signerOrProvider = signed ? provider.getSigner() : provider;
    return new ethers.Contract(CONTRACTS.USDT, ERC20_ABI, signerOrProvider);
  }, [getProvider]);

  const getAveraContract = useCallback((signed = false) => {
    const provider = getProvider();
    const signerOrProvider = signed ? provider.getSigner() : provider;
    return new ethers.Contract(CONTRACTS.AVERA_TOKEN, ERC20_ABI, signerOrProvider);
  }, [getProvider]);

  // ---- View Functions ----
  const getPresaleInfo = useCallback(async () => {
    const c = getPresaleContract();
    const info = await c.getPresaleInfo();
    return {
      currentRound: info.currentRound.toNumber(),
      currentPrice: info.currentPrice.toNumber(),
      totalSold: ethers.utils.formatUnits(info.totalSold, DECIMALS.AVERA),
      endTime: info.endTime.toNumber(),
      isActive: info.isActive,
    };
  }, [getPresaleContract]);

  const getPublicSaleInfo = useCallback(async () => {
    const c = getPresaleContract();
    const info = await c.getPublicSaleInfo();
    return {
      price: info.price.toNumber(),
      totalSold: ethers.utils.formatUnits(info.totalSold, DECIMALS.AVERA),
      totalAllocation: ethers.utils.formatUnits(info.totalAllocation, DECIMALS.AVERA),
      isActive: info.isActive,
    };
  }, [getPresaleContract]);

  const getAllPresaleRounds = useCallback(async () => {
    const c = getPresaleContract();
    const rounds = await c.getAllPresaleRounds();
    return rounds.map((r: any) => ({
      name: r.name,
      totalTokens: ethers.utils.formatUnits(r.totalTokens, DECIMALS.AVERA),
      suppliedTokens: ethers.utils.formatUnits(r.suppliedTokens, DECIMALS.AVERA),
      price: r.price.toNumber(),
      startTime: r.startTime.toNumber(),
      endTime: r.endTime.toNumber(),
      stakingRewardBP: r.stakingRewardBP.toNumber(),
      cliffTime: r.cliffTime.toNumber(),
      active: r.active,
    }));
  }, [getPresaleContract]);

  const getAllTokenomicsAllocations = useCallback(async () => {
    const c = getPresaleContract();
    const allocs = await c.getAllTokenomicsAllocations();
    return allocs.map((a: any) => ({
      name: a.name,
      totalTokens: ethers.utils.formatUnits(a.totalTokens, DECIMALS.AVERA),
      suppliedTokens: ethers.utils.formatUnits(a.suppliedTokens, DECIMALS.AVERA),
    }));
  }, [getPresaleContract]);

  const getOwner = useCallback(async () => {
    const c = getPresaleContract();
    return await c.owner();
  }, [getPresaleContract]);

  const checkIsOwner = useCallback(async () => {
    if (!address) return false;
    const owner = await getOwner();
    return owner.toLowerCase() === address.toLowerCase();
  }, [address, getOwner]);

  const getMinPurchase = useCallback(async () => {
    const c = getPresaleContract();
    const v = await c.minPurchase();
    return ethers.utils.formatUnits(v, DECIMALS.USDT);
  }, [getPresaleContract]);

  const getMaxPurchase = useCallback(async () => {
    const c = getPresaleContract();
    const v = await c.maxPurchase();
    return ethers.utils.formatUnits(v, DECIMALS.USDT);
  }, [getPresaleContract]);

  const getRecipient = useCallback(async () => {
    const c = getPresaleContract();
    return await c.getRecipient();
  }, [getPresaleContract]);

  const getTotalRewardUSDT = useCallback(async () => {
    const c = getPresaleContract();
    const v = await c.totalRewardUSDT();
    return ethers.utils.formatUnits(v, DECIMALS.USDT);
  }, [getPresaleContract]);

  const getUserPresaleVesting = useCallback(async (user: string, offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getUserPresaleVesting(user, offset, limit);
    return {
      data: result.data.map((v: any) => ({
        beneficiary: v.beneficiary,
        totalTokens: ethers.utils.formatUnits(v.totalTokens, DECIMALS.AVERA),
        remainingTokens: ethers.utils.formatUnits(v.remainingTokens, DECIMALS.AVERA),
        usdtAmount: ethers.utils.formatUnits(v.USDTAmount, DECIMALS.USDT),
        startTime: v.startTime.toNumber(),
        cliffEnd: v.cliffEnd.toNumber(),
        vestingEnd: v.vestingEnd.toNumber(),
        lastClaimTime: v.lastClaimTime.toNumber(),
        releaseInterval: v.releaseInterval.toNumber(),
        releasePercentBP: v.releasePercentBP.toNumber(),
        roundIndex: v.roundIndex.toNumber(),
        roundName: v.roundName,
        active: v.active,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getUserStakingRewards = useCallback(async (user: string, offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getUserStakingRewards(user, offset, limit);
    return {
      data: result.data.map((s: any) => ({
        beneficiary: s.beneficiary,
        rewardTokens: ethers.utils.formatUnits(s.rewardTokens, DECIMALS.USDT),
        remainingTokens: ethers.utils.formatUnits(s.remainingTokens, DECIMALS.USDT),
        monthlyReward: ethers.utils.formatUnits(s.monthlyReward, DECIMALS.USDT),
        roundName: s.roundName,
        startTime: s.startTime.toNumber(),
        endTime: s.endTime.toNumber(),
        lastClaimTime: s.lastClaimTime.toNumber(),
        releaseInterval: s.releaseInterval.toNumber(),
        active: s.active,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getPublicSalePurchases = useCallback(async (buyer: string, offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getPublicSalePurchasesByBuyer(buyer, offset, limit);
    return {
      data: result.data.map((p: any) => ({
        buyer: p.buyer,
        usdtAmount: ethers.utils.formatUnits(p.usdtAmount, DECIMALS.USDT),
        tokenAmount: ethers.utils.formatUnits(p.tokenAmount, DECIMALS.AVERA),
        purchaseTime: p.purchaseTime.toNumber(),
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getReferralsByReferrer = useCallback(async (referrer: string, offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getReferralsByReferrer(referrer, offset, limit);
    return {
      data: result.data.map((r: any) => ({
        referrer: r.referrer,
        buyer: r.buyer,
        usdtAmount: ethers.utils.formatUnits(r.usdtAmount, DECIMALS.USDT),
        rewardAmount: ethers.utils.formatUnits(r.rewardAmount, DECIMALS.USDT),
        timestamp: r.timestamp.toNumber(),
        roundName: r.roundName,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  // Admin view
  const getAllPrivateSaleData = useCallback(async (offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getAllPrivateSaleData(offset, limit);
    return {
      data: result.data.map((v: any) => ({
        beneficiary: v.beneficiary,
        totalTokens: ethers.utils.formatUnits(v.totalTokens, DECIMALS.AVERA),
        remainingTokens: ethers.utils.formatUnits(v.remainingTokens, DECIMALS.AVERA),
        usdtAmount: ethers.utils.formatUnits(v.USDTAmount, DECIMALS.USDT),
        roundName: v.roundName,
        active: v.active,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getAllPublicSaleData = useCallback(async (offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getAllPublicSaleData(offset, limit);
    return {
      data: result.data.map((p: any) => ({
        buyer: p.buyer,
        usdtAmount: ethers.utils.formatUnits(p.usdtAmount, DECIMALS.USDT),
        tokenAmount: ethers.utils.formatUnits(p.tokenAmount, DECIMALS.AVERA),
        purchaseTime: p.purchaseTime.toNumber(),
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getAllReferrals = useCallback(async (offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getAllReferrals(offset, limit);
    return {
      data: result.data.map((r: any) => ({
        referrer: r.referrer,
        buyer: r.buyer,
        usdtAmount: ethers.utils.formatUnits(r.usdtAmount, DECIMALS.USDT),
        rewardAmount: ethers.utils.formatUnits(r.rewardAmount, DECIMALS.USDT),
        timestamp: r.timestamp.toNumber(),
        roundName: r.roundName,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getAllStakingRewards = useCallback(async (offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getAllStakingReward(offset, limit);
    return {
      data: result.data.map((s: any) => ({
        beneficiary: s.beneficiary,
        rewardTokens: ethers.utils.formatUnits(s.rewardTokens, DECIMALS.USDT),
        remainingTokens: ethers.utils.formatUnits(s.remainingTokens, DECIMALS.USDT),
        monthlyReward: ethers.utils.formatUnits(s.monthlyReward, DECIMALS.USDT),
        roundName: s.roundName,
        active: s.active,
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getTokenomicsTransfers = useCallback(async (offset = 0, limit = 100) => {
    const c = getPresaleContract();
    const result = await c.getTokenomicsTransfers(offset, limit);
    return {
      data: result.data.map((t: any) => ({
        recipient: t.recipient,
        amount: ethers.utils.formatUnits(t.amount, DECIMALS.AVERA),
        transferTime: t.transferTime.toNumber(),
        category: t.category,
        allocationIndex: t.allocationIndex.toNumber(),
      })),
      total: result.total.toNumber(),
    };
  }, [getPresaleContract]);

  const getUsdtBalance = useCallback(async (user: string) => {
    const c = getUsdtContract();
    const bal = await c.balanceOf(user);
    return ethers.utils.formatUnits(bal, DECIMALS.USDT);
  }, [getUsdtContract]);

  const getAveraBalance = useCallback(async (user: string) => {
    const c = getAveraContract();
    const bal = await c.balanceOf(user);
    return ethers.utils.formatUnits(bal, DECIMALS.AVERA);
  }, [getAveraContract]);

  // ---- Write Functions ----
  const executeTx = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    try {
      const tx = await fn();
      const receipt = await tx.wait();
      return receipt;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveUSDT = useCallback(async (amount: string) => {
    return executeTx(async () => {
      const c = getUsdtContract(true);
      const parsedAmount = ethers.utils.parseUnits(amount, DECIMALS.USDT);
      return c.approve(CONTRACTS.AVERA_PRESALE, parsedAmount);
    });
  }, [executeTx, getUsdtContract]);

  const approveMaxUSDT = useCallback(async () => {
    return executeTx(async () => {
      const c = getUsdtContract(true);
      return c.approve(CONTRACTS.AVERA_PRESALE, ethers.constants.MaxUint256);
    });
  }, [executeTx, getUsdtContract]);

  const checkUsdtAllowance = useCallback(async () => {
    if (!address) return '0';
    const c = getUsdtContract();
    const allowance = await c.allowance(address, CONTRACTS.AVERA_PRESALE);
    return ethers.utils.formatUnits(allowance, DECIMALS.USDT);
  }, [address, getUsdtContract]);

  const buyPresaleTokens = useCallback(async (usdtAmount: string, referrer: string = ethers.constants.AddressZero) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(usdtAmount, DECIMALS.USDT);
      return c.buyPresaleTokens(parsed, referrer);
    });
  }, [executeTx, getPresaleContract]);

  const buyPublicSaleTokens = useCallback(async (usdtAmount: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(usdtAmount, DECIMALS.USDT);
      return c.buyPublicSaleTokens(parsed);
    });
  }, [executeTx, getPresaleContract]);

  const claimPresaleTokens = useCallback(async (index: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.claimPresaleTokens(index);
    });
  }, [executeTx, getPresaleContract]);

  const claimRewardToken = useCallback(async (index: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.claimRewardToken(index);
    });
  }, [executeTx, getPresaleContract]);

  // Admin write functions
  const startPresale = useCallback(async (index: number, startTimestamp: number, endTimestamp: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.startPresale(index, startTimestamp, endTimestamp);
    });
  }, [executeTx, getPresaleContract]);

  const pausePresale = useCallback(async () => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.pausePresale();
    });
  }, [executeTx, getPresaleContract]);

  const continuePresale = useCallback(async () => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.continuePresale();
    });
  }, [executeTx, getPresaleContract]);

  const closePresale = useCallback(async () => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.closePresale();
    });
  }, [executeTx, getPresaleContract]);

  const startPublicSale = useCallback(async () => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.startPublicSale();
    });
  }, [executeTx, getPresaleContract]);

  const pausePublicSale = useCallback(async () => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.pausePublicSale();
    });
  }, [executeTx, getPresaleContract]);

  const updatePresalePrice = useCallback(async (round: number, newPrice: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.updatePresalePrice(round, newPrice);
    });
  }, [executeTx, getPresaleContract]);

  const updatePresaleTime = useCallback(async (round: number, startTime: number, endTime: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.updatePresaleTime(round, startTime, endTime);
    });
  }, [executeTx, getPresaleContract]);

  const updatePublicSalePrice = useCallback(async (newPrice: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.updatePublicSalePrice(newPrice);
    });
  }, [executeTx, getPresaleContract]);

  const changeRecipient = useCallback(async (newRecipient: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.changeRecipient(newRecipient);
    });
  }, [executeTx, getPresaleContract]);

  const changeMinPurchase = useCallback(async (amount: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(amount, DECIMALS.USDT);
      return c.changeMinPurchase(parsed);
    });
  }, [executeTx, getPresaleContract]);

  const changeMaxPurchase = useCallback(async (amount: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(amount, DECIMALS.USDT);
      return c.changeMaxPurchase(parsed);
    });
  }, [executeTx, getPresaleContract]);

  const changeAVERAToken = useCallback(async (newToken: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.changeAVERAToken(newToken);
    });
  }, [executeTx, getPresaleContract]);

  const changeUSDTToken = useCallback(async (newToken: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      return c.changeUSDTToken(newToken);
    });
  }, [executeTx, getPresaleContract]);

  const recoverTokens = useCallback(async (amount: string, to: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(amount, DECIMALS.AVERA);
      return c.recoverTokens(parsed, to);
    });
  }, [executeTx, getPresaleContract]);

  const recoverUSDTTokens = useCallback(async (amount: string, to: string) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(amount, DECIMALS.USDT);
      return c.recoverUSDTTokens(parsed, to);
    });
  }, [executeTx, getPresaleContract]);

  const transferTokenomicsAllocation = useCallback(async (recipient: string, amount: string, allocationIndex: number) => {
    return executeTx(async () => {
      const c = getPresaleContract(true);
      const parsed = ethers.utils.parseUnits(amount, DECIMALS.AVERA);
      return c.transferTokenomicsAllocation(recipient, parsed, allocationIndex);
    });
  }, [executeTx, getPresaleContract]);

  return {
    address,
    isConnected,
    loading,
    // View
    getPresaleInfo,
    getPublicSaleInfo,
    getAllPresaleRounds,
    getAllTokenomicsAllocations,
    getOwner,
    checkIsOwner,
    getMinPurchase,
    getMaxPurchase,
    getRecipient,
    getTotalRewardUSDT,
    getUserPresaleVesting,
    getUserStakingRewards,
    getPublicSalePurchases,
    getReferralsByReferrer,
    getAllPrivateSaleData,
    getAllPublicSaleData,
    getAllReferrals,
    getAllStakingRewards,
    getTokenomicsTransfers,
    getUsdtBalance,
    getAveraBalance,
    checkUsdtAllowance,
    // User write
    approveUSDT,
    approveMaxUSDT,
    buyPresaleTokens,
    buyPublicSaleTokens,
    claimPresaleTokens,
    claimRewardToken,
    // Admin write
    startPresale,
    pausePresale,
    continuePresale,
    closePresale,
    startPublicSale,
    pausePublicSale,
    updatePresalePrice,
    updatePresaleTime,
    updatePublicSalePrice,
    changeRecipient,
    changeMinPurchase,
    changeMaxPurchase,
    changeAVERAToken,
    changeUSDTToken,
    recoverTokens,
    recoverUSDTTokens,
    transferTokenomicsAllocation,
  };
}
