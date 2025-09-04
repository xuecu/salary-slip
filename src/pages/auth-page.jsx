import { useNavigate, useParams } from 'react-router';
import { useState, useContext } from 'react';
import { SalaryContext } from '../context/salary.context';
import { Loading } from '../components/loading';
import SendRequest from '../serviceApi';
import styled from 'styled-components';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
export default function AuthPage() {
	const { setDetailPDF, setIsVerified } = useContext(SalaryContext);
	const { id } = useParams();
	const [load, setLoad] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleVerify = async (last4Digits) => {
		if (load) return;
		setError('');
		setLoad(true);
		const send = {
			do: 'ComfirmAuth',
			id: id,
			auth: last4Digits,
		};
		try {
			const response = await SendRequest('POST', send);
			if (!response.success) throw new Error(response.message);
			const blob = await fetch(`data:application/pdf;base64,${response.data}`).then((res) =>
				res.blob()
			);
			setDetailPDF(URL.createObjectURL(blob)); // 由後端回傳對應 PDF 預覽連結
			setIsVerified(true);
			navigate(`/${id}/comfirm`);
		} catch (error) {
			console.error(error);
			setError(error.message);
		} finally {
			setLoad(false);
		}
	};

	return (
		<Container>
			<IDVerifyForm
				onVerify={handleVerify}
				error={error}
				load={load}
			/>
		</Container>
	);
}

function IDVerifyForm({ onVerify, error, load }) {
	const [input, setInput] = useState('');
	const [showToggle, setShowToggle] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (input.length === 4) {
			onVerify(input);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>請輸入您的身分證後四碼：</label>
			<div>
				<input
					value={input}
					type={showToggle ? 'text' : 'password'}
					onChange={(e) => setInput(e.target.value)}
					maxLength={4}
				/>
				<ToggleButton onClick={() => setShowToggle(!showToggle)}>
					{showToggle ? <EyeInvisibleOutlined /> : <EyeOutlined />}
				</ToggleButton>
			</div>
			<button type="submit">
				<div>{load ? <Loading /> : '送出'}</div>
			</button>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</form>
	);
}

const Container = styled.div`
	background: #0000007d;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	form {
		width: 50%;
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0 auto;
		padding: 20px;
		background-color: #fff;
		border-radius: 20px;
		border: 1px solid #969696ff;
		label {
			font-size: 20px;
		}
		input {
			width: 100%;
			height: 30px;
			font-size: 20px;
			padding: 20px;
		}
		> div {
			position: relative;
			width: 100%;
		}
		button {
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			font-size: 20px;
			border: none;
			padding: 5px;
			background-color: #2f7bff;
			border-radius: 5px;
			color: #fff;
		}
	}
`;

const ToggleButton = styled.span`
	position: absolute;
	right: 20px;
	top: 50%;
	transform: translateY(-50%);
`;
