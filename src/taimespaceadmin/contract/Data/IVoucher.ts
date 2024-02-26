// src/interfaces/IVoucher.ts
import Decimal from 'decimal.js';

export type FileRoles = 'original' | 'image' | 'pdf' | 'rawtext'

export interface IVoucherFileSchema{
  fileId: string;
  role: FileRoles;
}

export type VoucherState = 'new' | 'in-progress' | 'waiting-for-user' | 'completed';
export type VoucherType = 'unknown' | 'no-voucher' | 'voucher';

export default interface IVoucher {
  id: string;
  name: string;
  type: VoucherType;
  state: VoucherState;
  files: IVoucherFileSchema[];
  sender: string | null;
  recipient: string | null;
  voucherDate: Date | null;
  amount: Decimal | null;
  created: Date;
}
