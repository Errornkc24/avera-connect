import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { usePresaleContract } from '@/hooks/usePresaleContract';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Coins, TrendingUp, Clock, Wallet, Gift, RefreshCw, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

export default function UserDashboard() {
  const { isConnected, address } = useAppKitAccount();
  const contract = usePresaleContract();

  const [isOwner, setIsOwner] = useState(false);
  const [presaleInfo, setPresaleInfo] = useState<any>(null);
  const [publicSaleInfo, setPublicSaleInfo] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [vestings, setVestings] = useState<any[]>([]);
  const [stakingRewards, setStakingRewards] = useState<any[]>([]);
  const [publicPurchases, setPublicPurchases] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [averaBalance, setAveraBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [minPurchase, setMinPurchase] = useState('10');
  const [maxPurchase, setMaxPurchase] = useState('1200');

  const [buyAmount, setBuyAmount] = useState('');
  const [referrerAddress, setReferrerAddress] = useState('');
  const [publicBuyAmount, setPublicBuyAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'presale' | 'public' | 'vesting' | 'staking' | 'referrals'>('presale');

  const loadData = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const [pi, psi, rds, owner, uBal, aBal, allow, minP, maxP] = await Promise.all([
        contract.getPresaleInfo(),
        contract.getPublicSaleInfo(),
        contract.getAllPresaleRounds(),
        contract.checkIsOwner(),
        contract.getUsdtBalance(address),
        contract.getAveraBalance(address),
        contract.checkUsdtAllowance(),
        contract.getMinPurchase(),
        contract.getMaxPurchase(),
      ]);
      setPresaleInfo(pi);
      setPublicSaleInfo(psi);
      setRounds(rds);
      setIsOwner(owner);
      setUsdtBalance(uBal);
      setAveraBalance(aBal);
      setAllowance(allow);
      setMinPurchase(minP);
      setMaxPurchase(maxP);

      const [vest, stake, pubPurch, refs] = await Promise.all([
        contract.getUserPresaleVesting(address),
        contract.getUserStakingRewards(address),
        contract.getPublicSalePurchases(address),
        contract.getReferralsByReferrer(address),
      ]);
      setVestings(vest.data);
      setStakingRewards(stake.data);
      setPublicPurchases(pubPurch.data);
      setReferrals(refs.data);
    } catch (e: any) {
      console.error('Load error:', e);
    }
  }, [isConnected, address, contract]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async () => {
    try {
      await contract.approveMaxUSDT();
      toast.success('USDT approved successfully');
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Approval failed');
    }
  };

  const handleBuyPresale = async () => {
    if (!buyAmount) return;
    try {
      const ref = referrerAddress && ethers.utils.isAddress(referrerAddress)
        ? referrerAddress
        : ethers.constants.AddressZero;
      await contract.buyPresaleTokens(buyAmount, ref);
      toast.success('Presale tokens purchased!');
      setBuyAmount('');
      setReferrerAddress('');
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Purchase failed');
    }
  };

  const handleBuyPublic = async () => {
    if (!publicBuyAmount) return;
    try {
      await contract.buyPublicSaleTokens(publicBuyAmount);
      toast.success('Public sale tokens purchased!');
      setPublicBuyAmount('');
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Purchase failed');
    }
  };

  const handleClaimVesting = async (index: number) => {
    try {
      await contract.claimPresaleTokens(index);
      toast.success('Tokens claimed successfully');
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Claim failed');
    }
  };

  const handleClaimStaking = async (index: number) => {
    try {
      await contract.claimRewardToken(index);
      toast.success('Staking reward claimed');
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Claim failed');
    }
  };

  const needsApproval = parseFloat(allowance) < parseFloat(buyAmount || '0') || parseFloat(allowance) < parseFloat(publicBuyAmount || '0');

  const formatNumber = (n: string) => {
    const num = parseFloat(n);
    if (isNaN(num)) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatTime = (ts: number) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleString();
  };

  const tabs = [
    { key: 'presale', label: 'Presale' },
    { key: 'public', label: 'Public Sale' },
    { key: 'vesting', label: 'Vesting' },
    { key: 'staking', label: 'Staking Rewards' },
    { key: 'referrals', label: 'Referrals' },
  ] as const;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header isOwner={false} />
        <div className="flex min-h-[80vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight-display text-foreground">
              Secure your position in Avera
            </h1>
            <p className="mt-2 text-muted-foreground">
              Connect your wallet to access the presale dashboard
            </p>
            <div className="mt-6">
              {/* @ts-ignore */}
              <appkit-button />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isOwner={isOwner} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Balances */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="USDT Balance" value={formatNumber(usdtBalance)} suffix="USDT" icon={<Coins className="h-4 w-4" />} />
          <StatCard label="AVERA Balance" value={formatNumber(averaBalance)} suffix="AVERA" icon={<TrendingUp className="h-4 w-4" />} />
          {presaleInfo && (
            <>
              <StatCard
                label={`Round: ${rounds[presaleInfo.currentRound]?.name || presaleInfo.currentRound}`}
                value={presaleInfo.isActive ? 'Active' : 'Inactive'}
                icon={<Clock className="h-4 w-4" />}
              />
              <StatCard
                label="Total Presale Sold"
                value={formatNumber(presaleInfo.totalSold)}
                suffix="AVERA"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </>
          )}
        </div>

        {/* Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {/* Presale Tab */}
          {activeTab === 'presale' && (
            <motion.div key="presale" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Rounds Overview */}
              <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Presale Rounds</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Round</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Sold / Total</th>
                        <th className="pb-3 font-medium">Staking Reward</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rounds.map((r, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium text-foreground">{r.name}</td>
                          <td className="py-3 font-mono-data text-foreground">{r.price / 1000} USDT</td>
                          <td className="py-3 font-mono-data text-foreground">
                            {formatNumber(r.suppliedTokens)} / {formatNumber(r.totalTokens)}
                          </td>
                          <td className="py-3 font-mono-data text-foreground">{(r.stakingRewardBP / 100).toFixed(1)}%</td>
                          <td className="py-3"><StatusBadge status={r.active} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Buy Presale */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Buy Presale Tokens</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Min: {minPurchase} USDT · Max: {maxPurchase} USDT
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Amount in USDT"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="pr-16 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">USDT</span>
                  </div>
                  <Input
                    placeholder="Referrer address (optional)"
                    value={referrerAddress}
                    onChange={(e) => setReferrerAddress(e.target.value)}
                    className="font-mono-data text-sm"
                  />
                  {buyAmount && presaleInfo && (
                    <p className="text-sm text-muted-foreground">
                      You will receive ≈ {formatNumber(String((parseFloat(buyAmount) * 1e18) / (presaleInfo.currentPrice)))} AVERA
                    </p>
                  )}
                  <div className="flex gap-3">
                    {needsApproval && (
                      <Button onClick={handleApprove} disabled={contract.loading} variant="outline" className="flex-1">
                        {contract.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Approve USDT
                      </Button>
                    )}
                    <Button
                      onClick={handleBuyPresale}
                      disabled={contract.loading || !buyAmount || !presaleInfo?.isActive}
                      className="flex-1 active:scale-[0.98] transition-transform"
                    >
                      {contract.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Buy Presale Tokens
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Public Sale Tab */}
          {activeTab === 'public' && (
            <motion.div key="public" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {publicSaleInfo && (
                  <>
                    <StatCard label="Public Sale Price" value={String(publicSaleInfo.price / 1000)} suffix="USDT" />
                    <StatCard label="Total Sold" value={formatNumber(publicSaleInfo.totalSold)} suffix="AVERA" />
                    <StatCard label="Status" value={publicSaleInfo.isActive ? 'Active' : 'Inactive'} />
                  </>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Buy Public Sale Tokens</h2>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Amount in USDT"
                      value={publicBuyAmount}
                      onChange={(e) => setPublicBuyAmount(e.target.value)}
                      className="pr-16 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">USDT</span>
                  </div>
                  <div className="flex gap-3">
                    {parseFloat(allowance) < parseFloat(publicBuyAmount || '0') && (
                      <Button onClick={handleApprove} disabled={contract.loading} variant="outline" className="flex-1">
                        Approve USDT
                      </Button>
                    )}
                    <Button
                      onClick={handleBuyPublic}
                      disabled={contract.loading || !publicBuyAmount || !publicSaleInfo?.isActive}
                      className="flex-1 active:scale-[0.98] transition-transform"
                    >
                      {contract.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Buy Tokens
                    </Button>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              {publicPurchases.length > 0 && (
                <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Your Purchases</h3>
                  <div className="space-y-3">
                    {publicPurchases.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                        <div>
                          <p className="font-mono-data text-sm text-foreground">{formatNumber(p.tokenAmount)} AVERA</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(p.usdtAmount)} USDT · {formatTime(p.purchaseTime)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Vesting Tab */}
          {activeTab === 'vesting' && (
            <motion.div key="vesting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Your Vesting Schedules</h2>
                {vestings.length === 0 ? (
                  <p className="text-muted-foreground">No vesting schedules found</p>
                ) : (
                  <div className="space-y-4">
                    {vestings.map((v, i) => (
                      <div key={i} className="rounded-lg border border-border/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-medium text-foreground">{v.roundName}</span>
                          <StatusBadge status={v.active ? 1 : 0} />
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Tokens</p>
                            <p className="font-mono-data text-foreground">{formatNumber(v.totalTokens)} AVERA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-mono-data text-foreground">{formatNumber(v.remainingTokens)} AVERA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">USDT Spent</p>
                            <p className="font-mono-data text-foreground">{formatNumber(v.usdtAmount)} USDT</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cliff End</p>
                            <p className="font-mono-data text-foreground">{formatTime(v.cliffEnd)}</p>
                          </div>
                        </div>
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="h-2 w-full rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.max(0, ((parseFloat(v.totalTokens) - parseFloat(v.remainingTokens)) / parseFloat(v.totalTokens)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleClaimVesting(i)}
                          disabled={!v.active || contract.loading}
                          size="sm"
                          className="active:scale-[0.98] transition-transform"
                        >
                          {contract.loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Claim Tokens
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && (
            <motion.div key="staking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Staking Rewards</h2>
                {stakingRewards.length === 0 ? (
                  <p className="text-muted-foreground">No staking rewards found</p>
                ) : (
                  <div className="space-y-4">
                    {stakingRewards.map((s, i) => (
                      <div key={i} className="rounded-lg border border-border/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-medium text-foreground">{s.roundName}</span>
                          <StatusBadge status={s.active ? 1 : 0} />
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Reward</p>
                            <p className="font-mono-data text-foreground">{formatNumber(s.rewardTokens)} USDT</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-mono-data text-foreground">{formatNumber(s.remainingTokens)} USDT</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Reward</p>
                            <p className="font-mono-data text-foreground">{formatNumber(s.monthlyReward)} USDT</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Time</p>
                            <p className="font-mono-data text-foreground">{formatTime(s.endTime)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleClaimStaking(i)}
                          disabled={!s.active || contract.loading}
                          size="sm"
                          className="active:scale-[0.98] transition-transform"
                        >
                          {contract.loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Claim Reward
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <motion.div key="referrals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Your Referral Rewards</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  <Gift className="mr-1 inline h-4 w-4" />
                  Share your address as referral to earn 7% of purchases
                </p>
                <div className="mb-4 rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Your referral address</p>
                  <p className="font-mono-data text-sm text-foreground break-all">{address}</p>
                </div>
                {referrals.length === 0 ? (
                  <p className="text-muted-foreground">No referral rewards yet</p>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((r, i) => (
                      <div key={i} className="rounded-lg border border-border/50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono-data text-sm text-foreground">{formatNumber(r.rewardAmount)} USDT earned</p>
                            <p className="text-xs text-muted-foreground">
                              From {r.buyer.slice(0, 6)}...{r.buyer.slice(-4)} · {r.roundName} · {formatTime(r.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
