import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 20px;
	height: 20px;
	border: 3px solid rgba(0, 0, 0, 0.2);
	border-top: 3px solid black;
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

export function Loading() {
	return <LoadingSpinner></LoadingSpinner>;
}
