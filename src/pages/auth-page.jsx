import { useNavigate, useParams } from 'react-router';
import { useState, useContext } from 'react';
import { SalaryContext } from '../context/salary.context';
import { Loading } from '../components/loading';
import SendRequest from '../serviceApi';

export default function AuthPage() {
	const { setDetailPDF } = useContext(SalaryContext);
	const { id } = useParams();
	const [load, setLoad] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleVerify = async (last4Digits) => {
		const send = {
			do: 'ComfirmAuth',
			id: id,
			auth: last4Digits,
		};
		try {
			console.log('send', send);
			setLoad(true);
			const response = await SendRequest('POST', send);
			if (!response.success) throw new Error(response.message);
			console.log(response.message);
			// setDetailPDF(response.pdfUrl); // 由後端回傳對應 PDF 預覽連結
			// navigate(`/${id}/comfirm`);
		} catch (error) {
			setError(JSON.stringify(error));
			console.error(error);
		} finally {
			setLoad(false);
		}
	};

	return (
		<div>
			<IDVerifyForm
				onVerify={handleVerify}
				error={error}
				load={load}
			/>
		</div>
	);
}

function IDVerifyForm({ onVerify, error, load }) {
	const [input, setInput] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		if (input.length === 4) {
			onVerify(input);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>請輸入您的身分證後四碼：</label>
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				maxLength={4}
			/>
			<button type="submit">{load ? <Loading /> : '送出'}</button>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</form>
	);
}
