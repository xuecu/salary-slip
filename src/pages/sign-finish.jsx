import { useContext, useState, useEffect } from 'react';
import { SalaryContext } from '../context/salary.context';
import { useNavigate, useParams } from 'react-router';

import styled from 'styled-components';

export default function SignFinish() {
	const { signSalaryPDF, isVerified } = useContext(SalaryContext);
	const [currentIndex, setCurrentIndex] = useState(0); // ➤ 控制目前頁數
	const [currentPDF, setCurrentPDF] = useState(''); // ➤ 控制目前頁數
	const [isLoading, setIsLoading] = useState(true);
	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isVerified) {
			navigate(`/${id}`);
		}
	}, [isVerified]);
	// 第一段：資料一進來就載入第一份 PDF
	useEffect(() => {
		if (signSalaryPDF.length > 0) {
			setCurrentIndex(0);
			setCurrentPDF(signSalaryPDF[0].pdfId);
			setIsLoading(false);
		}
	}, [signSalaryPDF]);

	// 第二段：切換頁數時顯示對應的 PDF
	useEffect(() => {
		if (signSalaryPDF.length > 0 && currentIndex < signSalaryPDF.length) {
			setCurrentPDF(signSalaryPDF[currentIndex].pdfId);
		}
	}, [currentIndex]);
	return (
		<Container>
			<h3>簽署完成</h3>
			<div
				style={{
					width: '80vw',
					height: '90vh',
					display: 'flex',
					flexDirection: 'column',
					gap: '5px',
					margin: '0 auto',
				}}
			>
				<Pager>
					<div
						className="btn"
						onClick={() => {
							setCurrentIndex((prev) => Math.max(prev - 1, 0));
						}}
						disabled={currentIndex === 0}
					>
						← 上一份
					</div>
					<span style={{ margin: '0 1rem' }}>
						{currentIndex + 1} / {signSalaryPDF.length}
					</span>
					<div
						className="btn"
						onClick={() => {
							setCurrentIndex((prev) => Math.min(prev + 1, signSalaryPDF.length - 1));
						}}
						disabled={currentIndex === signSalaryPDF.length - 1}
					>
						下一份 →
					</div>
				</Pager>
				{isLoading ? (
					<p style={{ color: '#fff', textAlign: 'center' }}>載入中...</p>
				) : (
					<iframe
						src={currentPDF}
						width="100%"
						height="100%"
						style={{ border: 'none' }}
						title="PDF viewer"
					/>
				)}
			</div>
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
const Pager = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 5px;
	span {
		color: #fff;
		margin: 0 1rem;
	}
	.btn {
		background-color: #2f7bff;
		border-radius: 5px;
		color: #fff;
		cursor: pointer;
		padding: 5px 20px;
	}
`;
