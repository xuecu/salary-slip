import { createContext, useState } from 'react';

export const SalaryContext = createContext({
	detailPDF: '',
	setDetailPDF: () => {},
});

export const SalaryProvider = ({ children }) => {
	const [detailPDF, setDetailPDF] = useState('');
	const value = { detailPDF, setDetailPDF };
	return <SalaryContext.Provider value={value}>{children}</SalaryContext.Provider>;
};
