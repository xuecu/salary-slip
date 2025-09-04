import { useRef, useState, useContext, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { SalaryContext } from '../context/salary.context';
import { useNavigate, useParams } from 'react-router';
import { PDFDocument, rgb } from 'pdf-lib';
import { Loading } from '../components/loading';
import styled from 'styled-components';
import SendRequest from '../serviceApi';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url
).toString();

export default function SignPdfPage() {
	const { remunerationPDF, isVerified, setSignSalaryPDF } = useContext(SalaryContext);
	const [currentIndex, setCurrentIndex] = useState(0); // ➤ 控制目前頁數
	const [currentPDF, setCurrentPDF] = useState(''); // ➤ 控制目前頁數
	const [isLoading, setIsLoading] = useState(true);
	const [uploadedImage, setUploadedImage] = useState(null); // 使用者上傳的簽名圖
	const [hasSignature, setHasSignature] = useState(false); // 確保簽名存在
	const [load, setLoad] = useState(false);
	const [error, setError] = useState('');
	const canvasRef = useRef(null);
	const fileInputRef = useRef(null); // 新增 input 的 ref
	const { id } = useParams();
	const navigate = useNavigate();
	const isLastPage = currentIndex === remunerationPDF.length - 1;

	// 處理清除簽名
	const handleClear = () => {
		canvasRef.current.clear();
		setUploadedImage(null);
		setHasSignature(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = null; // ✅ 清除 input 的值
		}
	};

	// 處理上傳簽名圖
	const handleUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function (event) {
			const dataUrl = event.target.result;
			setUploadedImage(dataUrl);
			setHasSignature(true);

			// 將上傳的圖片畫到 canvas 上
			const img = new Image();
			img.onload = () => {
				const canvas = canvasRef.current.getCanvas();
				const ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				const aspectRatio = img.width / img.height;
				const canvasRatio = canvas.width / canvas.height;

				let drawWidth = canvas.width;
				let drawHeight = canvas.height;

				if (aspectRatio > canvasRatio) {
					// 圖片太寬
					drawWidth = canvas.width;
					drawHeight = canvas.width / aspectRatio;
				} else {
					// 圖片太高
					drawHeight = canvas.height;
					drawWidth = canvas.height * aspectRatio;
				}

				const dx = (canvas.width - drawWidth) / 2;
				const dy = (canvas.height - drawHeight) / 2;

				ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
			};
			img.src = dataUrl;
		};
		reader.readAsDataURL(file);
	};
	// 下載簽署後的 PDF
	const handleSave = async () => {
		if (load) return;
		setError('');
		if (!hasSignature) {
			alert('請先手寫簽名或上傳簽名圖檔');
			return;
		}
		if (!isLastPage) {
			alert('請先檢閱所有文件，才能簽署與送出。');
			return;
		}
		const confirmed = window.confirm('你確定要送出嗎？送出後將無法修改。');
		if (!confirmed) return;
		setLoad(true);
		// 從 SignatureCanvas 抓取簽名圖片
		const signatureDataUrl = canvasRef.current.getCanvas().toDataURL('image/png');

		const uploadSignSalaryList = [];
		const signSalaryList = [];
		for (const pdfurl of remunerationPDF) {
			const { name, pdfId } = pdfurl;
			const detail = await findSignaturePlaceholder(pdfId);
			console.log('簽名標記：', detail);

			// 讀取原始 PDF
			const existingPdfBytes = await fetch(pdfId).then((res) => res.arrayBuffer());
			const pdfDoc = await PDFDocument.load(existingPdfBytes);
			const page = pdfDoc.getPages()[0];
			const pngImage = await pdfDoc.embedPng(signatureDataUrl);

			page.drawRectangle({
				x: detail.transform[4] + 5,
				y: detail.transform[5] - 10,
				width: 100,
				height: 50,
				color: rgb(1, 1, 1),
			});
			// 自訂簽名位置與大小
			page.drawImage(pngImage, {
				x: detail.transform[4] + 5,
				y: detail.transform[5] - 10,
				width: 100,
				height: 50,
			});

			// 儲存 PDF 並觸發下載
			const pdfBytes = await pdfDoc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const file = new File([blob], `${name}`, { type: 'application/pdf' });
			uploadSignSalaryList.push(file);
			signSalaryList.push({
				name: name,
				pdfId: url,
			});
		}
		setSignSalaryPDF(signSalaryList);
		const send = {
			do: 'SalaryComfirmAlready',
			id: id,
			data: uploadSignSalaryList,
		};
		console.log(send);
		try {
			const response = await SendRequest('POST', send, { form: true });
			if (!response.success) throw new Error(response.message);
			// console.log('response.data : ', response.data);

			navigate(`/${id}/signFinish`);
		} catch (error) {
			console.error(error);
			setError(error.message);
		} finally {
			setLoad(false);
		}
	};
	// 測量位置
	const findSignaturePlaceholder = async (pdfUrl) => {
		const loadingTask = pdfjsLib.getDocument(pdfUrl);
		const pdf = await loadingTask.promise;
		const page = await pdf.getPage(1); // 假設簽名在第 1 頁

		const textContent = await page.getTextContent();

		for (const item of textContent.items) {
			if (item.str.includes('{{sign}}')) {
				// item.transform 中包含 x, y, width, height
				return {
					...item,
					pageIndex: 0,
				};
			}
		}

		return null;
	};

	// 使用者在手寫簽名時自動觸發
	const handleEndDrawing = () => {
		if (!canvasRef.current.isEmpty()) {
			setHasSignature(true);
		}
	};

	useEffect(() => {
		if (!isVerified) {
			navigate(`/${id}`);
		}
	}, [isVerified]);
	// 第一段：資料一進來就載入第一份 PDF
	useEffect(() => {
		if (remunerationPDF.length > 0) {
			setCurrentIndex(0);
			setCurrentPDF(remunerationPDF[0].pdfId);
			setIsLoading(false);
		}
	}, [remunerationPDF]);

	// 第二段：切換頁數時顯示對應的 PDF
	useEffect(() => {
		if (remunerationPDF.length > 0 && currentIndex < remunerationPDF.length) {
			setCurrentPDF(remunerationPDF[currentIndex].pdfId);
		}
	}, [currentIndex]);

	return (
		<Container>
			<h3>簽署勞務報酬單</h3>
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
						{currentIndex + 1} / {remunerationPDF.length}
					</span>
					<div
						className="btn"
						onClick={() => {
							setCurrentIndex((prev) =>
								Math.min(prev + 1, remunerationPDF.length - 1)
							);
						}}
						disabled={currentIndex === remunerationPDF.length - 1}
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
			<div
				style={{
					width: '80vw',
					display: 'flex',
					gap: '5px',
					margin: '0 auto',
					justifyContent: 'space-around',
				}}
			>
				<SignBoard>
					<label>請簽名：</label>
					<SignatureCanvas
						ref={canvasRef}
						onEnd={handleEndDrawing}
						canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }}
					/>
					<div
						style={{
							display: 'flex',
							gap: '5px',
							margin: '0 auto',
						}}
					>
						<label
							className="reset-btn"
							onClick={handleClear}
						>
							清除
						</label>
						<label
							className="upload-label"
							htmlFor="upload-signature"
						>
							上傳簽名檔
						</label>
						<input
							id="upload-signature"
							className="hidden-input"
							type="file"
							accept="image/png"
							onChange={handleUpload}
							ref={fileInputRef}
						/>
					</div>
				</SignBoard>
				<ComfirmBoard>
					{!isLastPage && (
						<p style={{ color: 'white' }}>請先檢閱所有文件，才能簽署與送出。</p>
					)}
					{error && <p style={{ color: 'red' }}>{error}</p>}
					<button
						className="submit-btn"
						onClick={handleSave}
					>
						{load ? <Loading /> : '簽署 PDF'}
					</button>
				</ComfirmBoard>
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

	/* .btn {
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
	} */
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
const SignBoard = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0 0 10px;
	border-radius: 8px;
	width: 350px;
	label {
		color: #fff;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.sigCanvas {
		border: 2px dashed #ccc;
		background: #fff;
		border-radius: 5px;
	}

	.upload-label {
		display: inline-block;
		padding: 6px 12px;
		cursor: pointer;
		background-color: #2f7bff;
		color: white;
		border-radius: 5px;
		text-align: center;
		width: fit-content;
	}
	.reset-btn {
		display: inline-block;
		padding: 6px 12px;
		cursor: pointer;
		background-color: #ff2f2f;
		color: white;
		border-radius: 5px;
		text-align: center;
		width: fit-content;
	}
	.hidden-input {
		display: none;
	}
`;

const ComfirmBoard = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 0 0 10px;
	border-radius: 8px;
	width: 350px;
	.submit-btn {
		border: none;
		font-size: 16px;
		display: inline-block;
		padding: 6px 12px;
		cursor: pointer;
		background-color: #2f7bff;
		color: white;
		border-radius: 5px;
		text-align: center;
		width: fit-content;
	}
`;
