import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { usePresaleContract } from '@/hooks/usePresaleContract';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Shield, AlertTriangle, Users, Coins, TrendingUp, Settings, Database } from 'lucide-react';

export default function AdminPanel() {
  const { isConnected, address } = useAppKitAccount();
  const contract = usePresaleContract();
  const navigate = useNavigate();

  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [presaleInfo, setPresaleInfo] = useState<any>(null);
  const [publicSaleInfo, setPublicSaleInfo] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [tokenomics, setTokenomics] = useState<any[]>([]);
  const [recipient, setRecipient] = useState('');
  const [totalRewardUSDT, setTotalRewardUSDT] = useState('0');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxPurchase, setMaxPurchase] = useState('');

  // All private sale / public sale / staking / referral data
  const [allPrivateSales, setAllPrivateSales] = useState<any[]>([]);
  const [allPublicSales, setAllPublicSales] = useState<any[]>([]);
  const [allStaking, setAllStaking] = useState<any[]>([]);
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [tokenTransfers, setTokenTransfers] = useState<any[]>([]);

  // Form states
  const [startRoundIndex, setStartRoundIndex] = useState('0');
  const [startTimestamp, setStartTimestamp] = useState('');
  const [endTimestamp, setEndTimestamp] = useState('');
  const [priceRound, setPriceRound] = useState('0');
  const [newPrice, setNewPrice] = useState('');
  const [timeRound, setTimeRound] = useState('0');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [newPublicPrice, setNewPublicPrice] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newMin, setNewMin] = useState('');
  const [newMax, setNewMax] = useState('');
  const [recoverAmount, setRecoverAmount] = useState('');
  const [recoverTo, setRecoverTo] = useState('');
  const [recoverUsdtAmount, setRecoverUsdtAmount] = useState('');
  const [recoverUsdtTo, setRecoverUsdtTo] = useState('');
  const [allocRecipient, setAllocRecipient] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocIndex, setAllocIndex] = useState('1');
  const [newAveraToken, setNewAveraToken] = useState('');
  const [newUsdtToken, setNewUsdtToken] = useState('');

  const [activeSection, setActiveSection] = useState<'overview' | 'rounds' | 'settings' | 'tokenomics' | 'data' | 'danger'>('overview');

  const loadData = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      setChecking(true);
      const owner = await contract.checkIsOwner();
      setIsOwner(owner);
      if (!owner) { setChecking(false); return; }

      const [pi, psi, rds, toks, rec, reward, minP, maxP] = await Promise.all([
        contract.getPresaleInfo(),
        contract.getPublicSaleInfo(),
        contract.getAllPresaleRounds(),
        contract.getAllTokenomicsAllocations(),
        contract.getRecipient(),
        contract.getTotalRewardUSDT(),
        contract.getMinPurchase(),
        contract.getMaxPurchase(),
      ]);
      setPresaleInfo(pi);
      setPublicSaleInfo(psi);
      setRounds(rds);
      setTokenomics(toks);
      setRecipient(rec);
      setTotalRewardUSDT(reward);
      setMinPurchase(minP);
      setMaxPurchase(maxP);

      const [priv, pub, stk, refs, txf] = await Promise.all([
        contract.getAllPrivateSaleData(0, 50),
        contract.getAllPublicSaleData(0, 50),
        contract.getAllStakingRewards(0, 50),
        contract.getAllReferrals(0, 50),
        contract.getTokenomicsTransfers(0, 50),
      ]);
      setAllPrivateSales(priv.data);
      setAllPublicSales(pub.data);
      setAllStaking(stk.data);
      setAllReferrals(refs.data);
      setTokenTransfers(txf.data);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  }, [isConnected, address, contract]);

  useEffect(() => { loadData(); }, [loadData]);

  const exec = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
      loadData();
    } catch (e: any) {
      toast.error(e?.reason || e?.message || 'Transaction failed');
    }
  };

  const formatNum = (n: string) => {
    const num = parseFloat(n);
    if (isNaN(num)) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toFixed(2);
  };
  const formatTime = (ts: number) => ts ? new Date(ts * 1000).toLocaleString() : '—';
  const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  const toTimestamp = (dateStr: string) => Math.floor(new Date(dateStr).getTime() / 1000);

  if (checking) {
    return (
      <div className="min-h-screen bg-background">
        <Header isOwner={false} />
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isConnected || !isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Header isOwner={false} />
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
            <p className="mt-2 text-muted-foreground">Only the contract owner can access this panel</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'rounds', label: 'Rounds', icon: Coins },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'tokenomics', label: 'Tokenomics', icon: Database },
    { key: 'data', label: 'Data', icon: Users },
    { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header isOwner={isOwner} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight-display text-foreground">Admin Panel</h1>

        {/* Section tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeSection === s.key
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Presale Status" value={presaleInfo?.isActive ? 'Active' : 'Inactive'} />
              <StatCard label="Public Sale Status" value={publicSaleInfo?.isActive ? 'Active' : 'Inactive'} />
              <StatCard label="Total Presale Sold" value={formatNum(presaleInfo?.totalSold || '0')} suffix="AVERA" />
              <StatCard label="Total Public Sold" value={formatNum(publicSaleInfo?.totalSold || '0')} suffix="AVERA" />
              <StatCard label="Total Staking Rewards" value={formatNum(totalRewardUSDT)} suffix="USDT" />
              <StatCard label="Min Purchase" value={minPurchase} suffix="USDT" />
              <StatCard label="Max Purchase" value={maxPurchase} suffix="USDT" />
              <StatCard label="Recipient" value={shortAddr(recipient)} />
            </div>
          </motion.div>
        )}

        {/* ROUNDS MANAGEMENT */}
        {activeSection === 'rounds' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Rounds table */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-foreground">All Rounds</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Sold / Total</th>
                      <th className="pb-3 font-medium">Start</th>
                      <th className="pb-3 font-medium">End</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 text-foreground">{i}</td>
                        <td className="py-3 font-medium text-foreground">{r.name}</td>
                        <td className="py-3 font-mono-data text-foreground">{r.price}</td>
                        <td className="py-3 font-mono-data text-foreground">{formatNum(r.suppliedTokens)} / {formatNum(r.totalTokens)}</td>
                        <td className="py-3 text-xs text-foreground">{formatTime(r.startTime)}</td>
                        <td className="py-3 text-xs text-foreground">{formatTime(r.endTime)}</td>
                        <td className="py-3"><StatusBadge status={r.active} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Start Presale Round */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Start Presale Round</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Round Index (0-6)</label>
                  <Input value={startRoundIndex} onChange={(e) => setStartRoundIndex(e.target.value)} type="number" min="0" max="6" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Start Time</label>
                  <Input type="datetime-local" value={startTimestamp} onChange={(e) => setStartTimestamp(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">End Time</label>
                  <Input type="datetime-local" value={endTimestamp} onChange={(e) => setEndTimestamp(e.target.value)} />
                </div>
              </div>
              <Button
                className="mt-3 active:scale-[0.98] transition-transform"
                disabled={contract.loading}
                onClick={() => exec(() => contract.startPresale(Number(startRoundIndex), toTimestamp(startTimestamp), toTimestamp(endTimestamp)), 'Presale round started')}
              >
                {contract.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Round
              </Button>
            </div>

            {/* Presale controls */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-3 font-semibold text-foreground">Pause Presale</h3>
                <Button variant="outline" className="w-full" disabled={contract.loading}
                  onClick={() => exec(() => contract.pausePresale(), 'Presale paused')}>
                  Pause
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-3 font-semibold text-foreground">Continue Presale</h3>
                <Button variant="outline" className="w-full" disabled={contract.loading}
                  onClick={() => exec(() => contract.continuePresale(), 'Presale continued')}>
                  Continue
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-3 font-semibold text-foreground">Close Presale</h3>
                <Button variant="destructive" className="w-full" disabled={contract.loading}
                  onClick={() => exec(() => contract.closePresale(), 'Presale closed')}>
                  Close
                </Button>
              </div>
            </div>

            {/* Update Presale Price */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Update Presale Price</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">Round</label>
                  <Input value={priceRound} onChange={(e) => setPriceRound(e.target.value)} type="number" min="0" max="6" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">New Price (raw)</label>
                  <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} type="number" />
                </div>
              </div>
              <Button className="mt-3" disabled={contract.loading}
                onClick={() => exec(() => contract.updatePresalePrice(Number(priceRound), Number(newPrice)), 'Price updated')}>
                Update Price
              </Button>
            </div>

            {/* Update Presale Time */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Update Presale Time</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Round</label>
                  <Input value={timeRound} onChange={(e) => setTimeRound(e.target.value)} type="number" min="0" max="6" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Start Time</label>
                  <Input type="datetime-local" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">End Time</label>
                  <Input type="datetime-local" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
                </div>
              </div>
              <Button className="mt-3" disabled={contract.loading}
                onClick={() => exec(() => contract.updatePresaleTime(Number(timeRound), toTimestamp(timeStart), toTimestamp(timeEnd)), 'Time updated')}>
                Update Time
              </Button>
            </div>

            {/* Public Sale controls */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Public Sale Controls</h3>
              <div className="flex gap-3 mb-4">
                <Button variant="outline" disabled={contract.loading}
                  onClick={() => exec(() => contract.startPublicSale(), 'Public sale started')}>
                  Start Public Sale
                </Button>
                <Button variant="outline" disabled={contract.loading}
                  onClick={() => exec(() => contract.pausePublicSale(), 'Public sale paused')}>
                  Pause Public Sale
                </Button>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">New Public Sale Price (raw)</label>
                  <Input value={newPublicPrice} onChange={(e) => setNewPublicPrice(e.target.value)} type="number" />
                </div>
                <Button disabled={contract.loading}
                  onClick={() => exec(() => contract.updatePublicSalePrice(Number(newPublicPrice)), 'Public sale price updated')}>
                  Update
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SETTINGS */}
        {activeSection === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Change Recipient</h3>
              <p className="mb-2 text-sm text-muted-foreground">Current: <span className="font-mono-data">{recipient}</span></p>
              <div className="flex gap-3">
                <Input value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} placeholder="New recipient address" className="flex-1 font-mono-data" />
                <Button disabled={contract.loading}
                  onClick={() => exec(() => contract.changeRecipient(newRecipient), 'Recipient changed')}>
                  Update
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Min Purchase</h3>
                <p className="mb-2 text-sm text-muted-foreground">Current: {minPurchase} USDT</p>
                <div className="flex gap-3">
                  <Input value={newMin} onChange={(e) => setNewMin(e.target.value)} placeholder="New min (USDT)" type="number" className="flex-1" />
                  <Button disabled={contract.loading}
                    onClick={() => exec(() => contract.changeMinPurchase(newMin), 'Min purchase updated')}>
                    Set
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Max Purchase</h3>
                <p className="mb-2 text-sm text-muted-foreground">Current: {maxPurchase} USDT</p>
                <div className="flex gap-3">
                  <Input value={newMax} onChange={(e) => setNewMax(e.target.value)} placeholder="New max (USDT)" type="number" className="flex-1" />
                  <Button disabled={contract.loading}
                    onClick={() => exec(() => contract.changeMaxPurchase(newMax), 'Max purchase updated')}>
                    Set
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Change AVERA Token</h3>
                <div className="flex gap-3">
                  <Input value={newAveraToken} onChange={(e) => setNewAveraToken(e.target.value)} placeholder="New token address" className="flex-1 font-mono-data" />
                  <Button disabled={contract.loading}
                    onClick={() => exec(() => contract.changeAVERAToken(newAveraToken), 'AVERA token changed')}>
                    Set
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Change USDT Token</h3>
                <div className="flex gap-3">
                  <Input value={newUsdtToken} onChange={(e) => setNewUsdtToken(e.target.value)} placeholder="New token address" className="flex-1 font-mono-data" />
                  <Button disabled={contract.loading}
                    onClick={() => exec(() => contract.changeUSDTToken(newUsdtToken), 'USDT token changed')}>
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TOKENOMICS */}
        {activeSection === 'tokenomics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Tokenomics Allocations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Supplied / Total</th>
                      <th className="pb-3 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenomics.map((t, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 text-foreground">{i}</td>
                        <td className="py-3 font-medium text-foreground">{t.name}</td>
                        <td className="py-3 font-mono-data text-foreground">{formatNum(t.suppliedTokens)} / {formatNum(t.totalTokens)}</td>
                        <td className="py-3 font-mono-data text-foreground">
                          {parseFloat(t.totalTokens) > 0 ? ((parseFloat(t.suppliedTokens) / parseFloat(t.totalTokens)) * 100).toFixed(1) : '0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">Transfer Tokenomics Allocation</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Allocation Index (1-7)</label>
                  <Input value={allocIndex} onChange={(e) => setAllocIndex(e.target.value)} type="number" min="1" max="7" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Recipient Address</label>
                  <Input value={allocRecipient} onChange={(e) => setAllocRecipient(e.target.value)} className="font-mono-data" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Amount (AVERA)</label>
                  <Input value={allocAmount} onChange={(e) => setAllocAmount(e.target.value)} type="number" />
                </div>
              </div>
              <Button className="mt-3" disabled={contract.loading}
                onClick={() => exec(() => contract.transferTokenomicsAllocation(allocRecipient, allocAmount, Number(allocIndex)), 'Allocation transferred')}>
                Transfer
              </Button>
            </div>

            {/* Token transfers history */}
            {tokenTransfers.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 font-semibold text-foreground">Transfer History</h3>
                <div className="space-y-2">
                  {tokenTransfers.map((t, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-3 text-sm">
                      <div>
                        <span className="font-medium text-foreground">{t.category}</span>
                        <span className="ml-2 font-mono-data text-muted-foreground">{shortAddr(t.recipient)}</span>
                      </div>
                      <span className="font-mono-data text-foreground">{formatNum(t.amount)} AVERA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* DATA */}
        {activeSection === 'data' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Private Sales */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">All Private Sale Data ({allPrivateSales.length})</h3>
              {allPrivateSales.length === 0 ? <p className="text-muted-foreground">No data</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Buyer</th>
                        <th className="pb-3 font-medium">Round</th>
                        <th className="pb-3 font-medium">Tokens</th>
                        <th className="pb-3 font-medium">USDT</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPrivateSales.map((v, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono-data text-foreground">{shortAddr(v.beneficiary)}</td>
                          <td className="py-2 text-foreground">{v.roundName}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(v.totalTokens)}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(v.usdtAmount)}</td>
                          <td className="py-2"><StatusBadge status={v.active ? 1 : 0} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Public Sales */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">All Public Sale Data ({allPublicSales.length})</h3>
              {allPublicSales.length === 0 ? <p className="text-muted-foreground">No data</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Buyer</th>
                        <th className="pb-3 font-medium">USDT</th>
                        <th className="pb-3 font-medium">Tokens</th>
                        <th className="pb-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPublicSales.map((p, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono-data text-foreground">{shortAddr(p.buyer)}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(p.usdtAmount)}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(p.tokenAmount)}</td>
                          <td className="py-2 text-xs text-foreground">{formatTime(p.purchaseTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Staking */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">All Staking Rewards ({allStaking.length})</h3>
              {allStaking.length === 0 ? <p className="text-muted-foreground">No data</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Round</th>
                        <th className="pb-3 font-medium">Reward</th>
                        <th className="pb-3 font-medium">Remaining</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStaking.map((s, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono-data text-foreground">{shortAddr(s.beneficiary)}</td>
                          <td className="py-2 text-foreground">{s.roundName}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(s.rewardTokens)} USDT</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(s.remainingTokens)} USDT</td>
                          <td className="py-2"><StatusBadge status={s.active ? 1 : 0} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Referrals */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="mb-4 font-semibold text-foreground">All Referrals ({allReferrals.length})</h3>
              {allReferrals.length === 0 ? <p className="text-muted-foreground">No data</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Referrer</th>
                        <th className="pb-3 font-medium">Buyer</th>
                        <th className="pb-3 font-medium">USDT</th>
                        <th className="pb-3 font-medium">Reward</th>
                        <th className="pb-3 font-medium">Round</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReferrals.map((r, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-mono-data text-foreground">{shortAddr(r.referrer)}</td>
                          <td className="py-2 font-mono-data text-foreground">{shortAddr(r.buyer)}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(r.usdtAmount)}</td>
                          <td className="py-2 font-mono-data text-foreground">{formatNum(r.rewardAmount)}</td>
                          <td className="py-2 text-foreground">{r.roundName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* DANGER ZONE */}
        {activeSection === 'danger' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-destructive">Danger Zone</h3>
              </div>

              {/* Recover AVERA */}
              <div className="mb-6 rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium text-foreground">Recover AVERA Tokens</h4>
                <div className="flex gap-3">
                  <Input value={recoverAmount} onChange={(e) => setRecoverAmount(e.target.value)} placeholder="Amount (AVERA)" type="number" className="flex-1" />
                  <Input value={recoverTo} onChange={(e) => setRecoverTo(e.target.value)} placeholder="To address" className="flex-1 font-mono-data" />
                  <Button variant="destructive" disabled={contract.loading}
                    onClick={() => exec(() => contract.recoverTokens(recoverAmount, recoverTo), 'AVERA tokens recovered')}>
                    Recover
                  </Button>
                </div>
              </div>

              {/* Recover USDT */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium text-foreground">Recover USDT Tokens</h4>
                <div className="flex gap-3">
                  <Input value={recoverUsdtAmount} onChange={(e) => setRecoverUsdtAmount(e.target.value)} placeholder="Amount (USDT)" type="number" className="flex-1" />
                  <Input value={recoverUsdtTo} onChange={(e) => setRecoverUsdtTo(e.target.value)} placeholder="To address" className="flex-1 font-mono-data" />
                  <Button variant="destructive" disabled={contract.loading}
                    onClick={() => exec(() => contract.recoverUSDTTokens(recoverUsdtAmount, recoverUsdtTo), 'USDT tokens recovered')}>
                    Recover
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
