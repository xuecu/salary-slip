import { useState, useContext } from 'react';
import { SalaryContext } from '../context/salary.context';

export default function ComfirmPage({ url }) {
	const { detailPDF } = useContext(SalaryContext);

	return (
		<div>
			<h3>請確認以下資料：</h3>
			<iframe
				src={detailPDF}
				width="100%"
				height="80vh"
				style={{ border: 'none' }}
			/>
			<div>內容無誤</div>
		</div>
	);
}
