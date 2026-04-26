export interface UserInfo {
  username: string;
  email: string;
  verified: boolean;
  profile_pic: string;
}

export interface Transaction {
  trxId: string;
  type: "TOPUP" | "TF_IN" | "TF_OUT" | "BUY" | "WD" | "ADJUST_IN" | "ADJUST_OUT";
  item: string;
  amount: number;
  totalTransfer: number;
  date: string;
  status: "SUCCESS" | "PENDING" | "EXPIRED" | "CANCELED";
  note?: string;
  uniqueCode?: number;
}

export interface TopupResponse {
  trxId: string;
  user_email: string;
  type: string;
  item: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalTransfer: number;
  expiry: number;
  qr_string: string;
}

export interface WithdrawDetail {
  ewallet: string;
  nomor: string;
  namaEwallet: string;
  product: string;
  harga: number;
  status: string;
}
