import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Loading } from '../components/loading';
import styled from 'styled-components';
import { SalaryContext } from '../context/salary.context';
import SendRequest from '../serviceApi';

export default function ComfirmPage() {
	const { detailPDF, isVerified, setRemunerationPDF } = useContext(SalaryContext);
	const [load, setLoad] = useState(false);
	const [error, setError] = useState('');

	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isVerified) {
			navigate(`/${id}`);
		}
	}, []);

	const submit = async () => {
		if (load) return;
		setLoad(true);
		setError('');
		const confirmed = window.confirm('你確定要送出嗎？送出後將無法修改。');
		if (!confirmed) return;
		const send = {
			do: 'SalaryComfirm',
			id: id,
		};
		try {
			const response = await SendRequest('POST', send);
			if (!response.success) throw new Error(response.message);
			const remunerationPDFList = [];
			for (const i of response.data) {
				const { name, pdfId } = i;
				const blob = await fetch(`data:application/pdf;base64,${pdfId}`).then((res) =>
					res.blob()
				);
				const url = URL.createObjectURL(blob);
				remunerationPDFList.push({
					name: name,
					pdfId: url,
				});
			}
			setRemunerationPDF(remunerationPDFList);
			navigate(`/${id}/signPDF`);
		} catch (error) {
			console.error(error);
			setError(error.message);
		} finally {
			setLoad(false);
		}
	};

	return (
		<Container>
			<h3>請確認以下資料：</h3>
			<div style={{ width: '80vw', height: '80vh', margin: '0 auto' }}>
				<iframe
					src={`${detailPDF}`}
					width="100%"
					height="100%"
					style={{ border: 'none' }}
				/>
			</div>
			<div
				className="btn"
				onClick={submit}
			>
				{load ? <Loading /> : '正確無誤'}
			</div>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</Container>
	);
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	background: #0000007d;
	padding: 20px 0 0;

	h3 {
		color: #fff;
	}

	.btn {
		display: flex;
		width: 200px;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		font-size: 20px;
		border: none;
		padding: 5px 20px;
		background-color: #2f7bff;
		border-radius: 5px;
		color: #fff;
	}
`;
