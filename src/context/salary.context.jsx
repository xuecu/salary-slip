import { createContext, useState } from 'react';

export const SalaryContext = createContext({
	detailPDF: '',
	setDetailPDF: () => {},
	isVerified: '',
	setIsVerified: () => {},
	remunerationPDF: [],
	setRemunerationPDF: () => {},
	signSalaryPDF: [],
	setSignSalaryPDF: () => {},
});

export const SalaryProvider = ({ children }) => {
	const [isVerified, setIsVerified] = useState(false);
	const [detailPDF, setDetailPDF] = useState('');
	const [remunerationPDF, setRemunerationPDF] = useState([]);
	const [signSalaryPDF, setSignSalaryPDF] = useState([]);
	const value = {
		detailPDF,
		setDetailPDF,
		isVerified,
		setIsVerified,
		remunerationPDF,
		setRemunerationPDF,
		signSalaryPDF,
		setSignSalaryPDF,
	};
	return <SalaryContext.Provider value={value}>{children}</SalaryContext.Provider>;
};
