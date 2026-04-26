/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { 
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Loader2,
  X,
  CreditCard,
  ArrowLeft,
  Info,
  Download,
  ShieldCheck,
  LayoutDashboard,
  History,
  Smartphone,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  UserSearch
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { cn, formatCurrency, formatDate } from "./lib/utils";
import { TopupResponse, Transaction } from "./types";

export default function App() {
  const [view, setView] = useState<"user" | "admin-login" | "admin-dashboard">("user");
  const [nominal, setNominal] = useState<string>("");
  const [trxData, setTrxData] = useState<TopupResponse | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Admin States
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [withdrawForm, setWithdrawForm] = useState({ ewallet: "dana", nomor: "", kode: "" });
  const [apiKey, setApiKey] = useState("");

  const DANA_PRODUCTS = [
    { id: "D1", name: "1.000", price: "1.150" },
    { id: "D2", name: "2.000", price: "2.150" },
    { id: "D3", name: "3.000", price: "3.150" },
    { id: "D4", name: "4.000", price: "4.150" },
    { id: "D5", name: "5.000", price: "5.150" },
    { id: "D10", name: "10.000", price: "10.150" },
    { id: "D15", name: "15.000", price: "15.150" },
    { id: "D20", name: "20.000", price: "20.150" },
    { id: "D25", name: "25.000", price: "25.150" },
    { id: "D30", name: "30.000", price: "30.150" },
    { id: "D35", name: "35.000", price: "35.150" },
    { id: "D40", name: "40.000", price: "40.150" },
    { id: "D45", name: "45.000", price: "45.150" },
    { id: "D50", name: "50.000", price: "50.150" },
    { id: "D55", name: "55.000", price: "55.150" },
    { id: "D60", name: "60.000", price: "60.150" },
    { id: "D65", name: "65.000", price: "65.150" },
    { id: "D70", name: "70.000", price: "70.150" },
    { id: "D75", name: "75.000", price: "75.150" },
    { id: "D80", name: "80.000", price: "80.150" },
    { id: "D85", name: "85.000", price: "85.150" },
    { id: "D90", name: "90.000", price: "90.150" },
    { id: "D95", name: "95.000", price: "95.150" },
    { id: "D100", name: "100.000", price: "100.150" },
    { id: "D125", name: "125.000", price: "125.150" },
    { id: "D150", name: "150.000", price: "150.150" },
    { id: "D200", name: "200.000", price: "200.150" },
    { id: "D250", name: "250.000", price: "250.150" },
    { id: "D300", name: "300.000", price: "300.150" },
    { id: "D400", name: "400.000", price: "400.150" },
    { id: "D500", name: "500.000", price: "500.150" },
    { id: "D600", name: "600.000", price: "600.150" },
    { id: "D700", name: "700.000", price: "700.150" },
    { id: "D800", name: "800.000", price: "800.150" },
    { id: "D900", name: "900.000", price: "900.150" },
    { id: "D1000", name: "1.000.000", price: "1.000.150" },
  ];

  const createPayment = async () => {
    if (!nominal || parseInt(nominal) < 1000) {
      setError("Nominal minimal Rp 1.000");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post("/api/proxy/topup", { nominal: parseInt(nominal) });
      if (res.data.status === 200) {
        setTrxData(res.data.data);
        setStatus("PENDING");
      } else {
        setError(res.data.message || "Gagal membuat pembayaran");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPayment = async () => {
    if (!trxData) return;
    setIsLoading(true);
    try {
      const res = await axios.post("/api/proxy/cancel", { trxId: trxData.trxId });
      if (res.data.status === 200) {
        setStatus("CANCELED");
        setTimeout(() => setTrxData(null), 2000);
      }
    } catch (err) {
      console.error("Cancel failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!trxData || (status !== "PENDING" && status !== "EXPIRED")) return;
    setIsPolling(true);
    try {
      const res = await axios.get("/api/proxy/check-status", {
        params: { idTransaksi: trxData.trxId }
      });
      if (res.data.status === 200) {
        setStatus(res.data.data.status);
      }
    } catch (err) {
      console.error("Status check failed", err);
    } finally {
      setIsPolling(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `QRIS-${trxData?.trxId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin Logic
  const handleAdminLogin = () => {
    if (adminUser === "Farel" && adminPass === "MuhFarel05") {
      setView("admin-dashboard");
      fetchAdminData();
    } else {
      alert("Username atau Password salah!");
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [sRes, hRes] = await Promise.all([
        axios.get("/api/proxy/saldo", { headers: apiKey ? { "x-api-key": apiKey } : {} }),
        axios.get("/api/proxy/history", { headers: apiKey ? { "x-api-key": apiKey } : {} })
      ]);
      if (sRes.data.status === 200) setSaldo(sRes.data.data.saldo);
      if (hRes.data.status === 200) setHistory(hRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.nomor || !withdrawForm.kode) return;
    setIsLoading(true);
    try {
      const res = await axios.get("/api/proxy/withdraw", {
        params: withdrawForm,
        headers: apiKey ? { "x-api-key": apiKey } : {}
      });
      alert(res.data.message || "Withdraw diproses");
      fetchAdminData();
    } catch (err) {
      alert("Gagal withdraw");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {view === "user" && (
            <motion.div key="user-view" className="w-full">
              {!trxData ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
                >
                  <div className="p-8 pb-4 text-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-100 mb-4">
                      <CreditCard size={32} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">FAREL PAYMENT</h1>
                    <p className="text-sm text-slate-400 mt-1">Sistem Pembayaran QRIS Otomatis</p>
                  </div>

                  <div className="p-8 pt-4 space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nominal Topup</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-300 group-focus-within:text-indigo-500 transition-colors">Rp</span>
                        <input 
                          type="number"
                          value={nominal}
                          onChange={(e) => setNominal(e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-5 text-2xl font-black outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-200"
                        />
                      </div>
                      {error && (
                        <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1">
                          <AlertCircle size={12} /> {error}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[10000, 20000, 50000, 100000, 200000, 500000].map((val) => (
                        <button 
                          key={val}
                          onClick={() => setNominal(val.toString())}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-black transition-all",
                            nominal === val.toString() ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-105" : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
                          )}
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <button 
                      disabled={isLoading || !nominal}
                      onClick={createPayment}
                      className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <QrCode size={20} />}
                      Bayar Sekarang
                    </button>

                    <div className="flex justify-center">
                      <button onClick={() => setView("admin-login")} className="text-[10px] text-slate-300 hover:text-indigo-500 flex items-center gap-1 transition-all">
                        <ShieldCheck size={12} /> Login Admin
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative"
                >
                  <div className="p-8 text-center space-y-6">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setTrxData(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm",
                        status === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                      )}>
                        {status === "PENDING" && <Clock size={12} className="animate-pulse" />}
                        {status}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</h2>
                      <p className="text-4xl font-black text-slate-900">{formatCurrency(trxData.totalTransfer)}</p>
                    </div>

                    {status === "PENDING" ? (
                      <>
                        <div ref={qrRef} className="bg-white p-6 rounded-3xl inline-block mx-auto border-4 border-slate-50 shadow-inner group relative">
                          <QRCodeCanvas value={trxData.qr_string} size={220} includeMargin={true} level="Q" />
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all pointer-events-none rounded-2xl"></div>
                          <button 
                            onClick={downloadQR}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 text-[10px] font-black text-indigo-600 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Download size={12} /> SIMPAN QR
                          </button>
                        </div>

                        <div className="space-y-3 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">ID Transaksi</span>
                            <span className="font-bold text-slate-600 font-mono">{trxData.trxId}</span>
                          </div>
                          <div className="flex justify-between text-xs pt-3 border-t border-slate-200/50">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Berlaku Hingga</span>
                            <span className="font-bold text-rose-500">{new Date(trxData.expiry).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={checkStatus}
                            disabled={isPolling}
                            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
                          >
                            {isPolling ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            CEK STATUS PEMBAYARAN
                          </button>
                          
                          <button 
                            onClick={cancelPayment}
                            disabled={isLoading}
                            className="text-slate-400 text-xs font-bold hover:text-rose-500 transition-all"
                          >
                            Batalkan Pembayaran
                          </button>
                        </div>
                      </>
                    ) : status === "SUCCESS" ? (
                      <div className="py-10 space-y-4">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Lunas!</h3>
                        <p className="text-sm text-slate-400 px-6">Pembayaran Anda sebesar {formatCurrency(trxData.totalTransfer)} telah berhasil diverifikasi.</p>
                        <button 
                          onClick={() => setTrxData(null)}
                          className="mt-6 w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all"
                        >
                          Selesai
                        </button>
                      </div>
                    ) : (
                      <div className="py-10 space-y-4">
                        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                          <X size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">Pembayaran Gagal</h3>
                        <p className="text-sm text-slate-400 px-6">Waktu pembayaran habis atau telah dibatalkan.</p>
                        <button 
                          onClick={() => setTrxData(null)}
                          className="mt-6 w-full bg-slate-900 text-white font-black py-4 rounded-2xl"
                        >
                          Kembali ke Awal
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {view === "admin-login" && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto bg-white rounded-[2rem] p-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl mb-4">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Gate</h2>
                <p className="text-sm text-slate-400 font-medium">Verify your credentials to gain access</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:scale-[1.02] transition-transform">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5 focus-within:scale-[1.02] transition-transform">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                  />
                </div>
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 mt-2 active:scale-95"
                >
                  ACCESS DASHBOARD
                </button>
                <button onClick={() => setView("user")} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">
                  Return to Storefront
                </button>
              </div>
            </motion.div>
          )}

          {view === "admin-dashboard" && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard Overview</h2>
                  <p className="text-slate-400 text-sm">Welcome back, <span className="text-slate-900 font-medium tracking-tight">Farel Alamsyah</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={fetchAdminData} className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-500 transition-all flex items-center gap-2 text-xs font-bold">
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    REFRESH
                  </button>
                  <button onClick={() => setView("user")} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                    TERMINATE SESSION
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm col-span-1 border-b-4 border-b-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Balance</p>
                    <Wallet size={16} className="text-indigo-500" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900">{formatCurrency(saldo)}</h3>
                  <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>API STATUS</span>
                    <span className="flex items-center gap-1.5 text-emerald-500">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> FR3 CONNECTED
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm col-span-1 md:col-span-2">
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                       <Smartphone size={18} className="text-slate-400" /> WITHDRAW INSTANT
                     </h4>
                     <p className="text-[10px] text-slate-400 font-medium tracking-tight">PROCESS AT 1.150 FLAT RATE</p>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Destination Number</label>
                          <div className="relative">
                            <input 
                              value={withdrawForm.nomor}
                              onChange={(e) => setWithdrawForm({...withdrawForm, nomor: e.target.value})}
                              placeholder="0857..."
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-500 transition-all focus:bg-white"
                            />
                            <Smartphone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          </div>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                           <button 
                            disabled={isLoading}
                            onClick={() => {
                              const code = "CEKD";
                              if (withdrawForm.nomor) {
                                 axios.post("/api/proxy/cek-ewallet", { code, dest: withdrawForm.nomor }, { headers: apiKey ? { "x-api-key": apiKey } : {} })
                                  .then(res => alert(res.data.status === 200 ? `Account Holder: ${res.data.result}` : "Verification failed"))
                                  .catch(() => alert("Network error"));
                              } else { alert("Please enter destination number"); }
                            }}
                            className="bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
                           >
                             <UserSearch size={14} /> VERIFY DANA OWNER
                           </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between pr-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select DANA Product</label>
                          {withdrawForm.kode && <span className="text-[10px] font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">SELECTED: {withdrawForm.kode}</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                           {DANA_PRODUCTS.map((prod) => (
                             <button
                              key={prod.id}
                              onClick={() => setWithdrawForm({...withdrawForm, kode: prod.id})}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1",
                                withdrawForm.kode === prod.id ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 scale-105" : "bg-white border-slate-100 hover:border-indigo-200"
                              )}
                             >
                               <div className={cn("text-[8px] font-black tracking-tighter uppercase", withdrawForm.kode === prod.id ? "text-indigo-200" : "text-slate-400")}>{prod.id}</div>
                               <div className={cn("text-xs font-black", withdrawForm.kode === prod.id ? "text-white" : "text-slate-900")}>{prod.name}</div>
                             </button>
                           ))}
                        </div>
                      </div>

                      <button 
                        disabled={isLoading || !withdrawForm.nomor || !withdrawForm.kode}
                        onClick={handleWithdraw}
                        className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                         {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                         EXECUTE INSTANT PAYOUT
                      </button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <History size={18} className="text-slate-400" /> TRANSACTION LEDGER
                  </h4>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50/50">
                         <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                         <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                         <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                         <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">State</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {history.map((trx) => (
                         <tr key={trx.trxId} className="hover:bg-slate-50/30 transition-all">
                           <td className="px-8 py-5">
                             <p className="text-xs font-bold text-slate-800 tracking-tight">{trx.item || "System Transaction"}</p>
                             <p className="text-[10px] font-mono text-indigo-500 uppercase font-black tracking-tighter">{trx.trxId}</p>
                           </td>
                           <td className="px-8 py-5">
                             <p className="text-[10px] text-slate-400 font-bold">{formatDate(trx.date)}</p>
                           </td>
                           <td className="px-8 py-5 text-right">
                             <p className={cn(
                               "font-black text-sm tracking-tighter",
                               (trx.type === "TOPUP" || trx.type === "TF_IN" || trx.type === "ADJUST_IN") ? "text-emerald-500" : "text-rose-500"
                             )}>
                               {(trx.type === "TOPUP" || trx.type === "TF_IN" || trx.type === "ADJUST_IN") ? "+" : "-"} {formatCurrency(trx.amount)}
                             </p>
                           </td>
                           <td className="px-8 py-5">
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[8px] font-black uppercase inline-flex items-center gap-1",
                               trx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : 
                               trx.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                             )}>
                               {trx.status}
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
