import styled from 'styled-components';

const MessageStyled = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 10px;
	gap: 20px;
`;

export function LoadingMessage({ message }) {
	if (message.length === 0) return;
	if (!Array.isArray(message)) return <MessageStyled>{message}</MessageStyled>;
	return (
		<MessageStyled>
			{message.map((msg, i) => (
				<MessageStyled key={i}>{msg}</MessageStyled>
			))}
		</MessageStyled>
	);
}
