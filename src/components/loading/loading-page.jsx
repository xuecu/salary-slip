import styled, { keyframes } from 'styled-components';

const spin = keyframes`
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
`;

const FullPageWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;

const Spinner = styled.div`
	border: 8px solid #eee;
	border-top: 8px solid #4a90e2;
	border-radius: 50%;
	width: 60px;
	height: 60px;
	animation: ${spin} 1s linear infinite;
`;

const Message = styled.div`
	margin-top: 20px;
	font-size: 18px;
	color: #333;
	text-align: center;
`;

export const LoadingPage = ({ message = '資料加載中，請稍候...' }) => {
	return (
		<FullPageWrapper>
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<Spinner />
				<Message>{message}</Message>
			</div>
		</FullPageWrapper>
	);
};
