"use client"
import IVoucher from '@/contract/Data/IVoucher';
// SelectedVoucherContext.tsx
import React from 'react';

interface VouchersContextProps {
  selectedVoucher: IVoucher | null;
  loadedVouchers: IVoucher[] | null;
  setSelectedVoucher: React.Dispatch<React.SetStateAction<IVoucher | null>>;
  setLoadedVouchers: React.Dispatch<React.SetStateAction<IVoucher[] | null>>;
  reloadVouchers: () => void;
}

const VouchersContext = React.createContext<VouchersContextProps | undefined>(undefined);

export function VouchersProvider({ children }: Readonly<{ children: React.ReactNode; }>) {
  const [selectedVoucher, setSelectedVoucher] = React.useState<IVoucher | null>(null);
  const [loadedVouchers, setLoadedVouchers] = React.useState<IVoucher[] | null>(null);
  const [reloadTrigger, setReloadTrigger] = React.useState(0);

  function reloadVouchers() {
    console.log('Reloading vouchers ' + reloadTrigger);
    window.localStorage.removeItem('loadedVouchers');
    setReloadTrigger(prev => (prev + 1) % 2);
  }

  React.useEffect(() => {
    console.log('VouchersProvider useEffect');
    const storedVoucherJson = window.localStorage.getItem('selectedVoucher');

    if (storedVoucherJson && storedVoucherJson != undefined) {
      console.log(storedVoucherJson)
      try {
        const storedVoucher = JSON.parse(storedVoucherJson);
        if (storedVoucher)
          setSelectedVoucher(storedVoucher);
        else
          setSelectedVoucher(null);
      }
      catch (error) {
        console.error('Error parsing stored voucher', error);
        setSelectedVoucher(null);
      }
    }
    else
      setSelectedVoucher(null);

    const storedLoadedVouchersJson = window.localStorage.getItem('loadedVouchers');
    let storedLoadedVouchers = storedLoadedVouchersJson != null ? JSON.parse(storedLoadedVouchersJson) : null;

    if (storedLoadedVouchers == null) {
      console.log('No stored vouchers found, loading');

      fetch('http://localhost:3001/qry/vouchers/search', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          data = data.map((v: any) => { v.created = Date.parse(v.created); return v as IVoucher; });
          setLoadedVouchers(data as IVoucher[]);
          window.localStorage.setItem('loadedVouchers', JSON.stringify(data));
        })
        .catch(error => {
          console.error('Error loading vouchers', error);
        });

    }
    setLoadedVouchers(storedLoadedVouchers);
  }, [reloadTrigger]);


  React.useEffect(() => {
    if (selectedVoucher !== null) {
      window.localStorage.setItem('selectedVoucher', JSON.stringify(selectedVoucher));
    }
  }, [selectedVoucher]);


  return (
    <VouchersContext.Provider value={{ selectedVoucher, setSelectedVoucher, loadedVouchers, setLoadedVouchers, reloadVouchers }}>
      {children}
    </VouchersContext.Provider>
  );
};

export default VouchersContext;