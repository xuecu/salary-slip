import styled from 'styled-components';

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(255, 255, 255, 0);
	z-index: 9999;
	cursor: wait;
`;

export function LoadingOverlay() {
	return <Overlay />;
}
