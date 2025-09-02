import { useState } from 'react';

export function useMessage() {
	const [messages, setMessages] = useState([]);

	const handleMessage = (params = {}) => {
		// Type | 'error', "success", "reset", "single", "continued"
		const { type = '', content = '' } = params;

		if (type === 'reset') {
			setMessages([]);
			return;
		}
		if (type === 'error') {
			setMessages((prev) => {
				const filtered = prev.filter((msg) => msg !== 'ing處理中');
				return [...filtered, `${content.length > 0 ? content : '❌ 執行失敗'}`];
			});
			return;
		}
		if (type === 'success') {
			setMessages((prev) => {
				const filtered = prev.filter((msg) => msg !== 'ing處理中');
				return [...filtered, `✅ 處理完畢`];
			});
			return;
		}
		if (type === 'single') {
			setMessages(() => {
				if (content.length === 0) return ['ing處理中'];
				return [`${content}`, 'ing處理中'];
			});
			return;
		}
		if (type === 'continued') {
			setMessages((prev) => {
				if (content.length === 0) return ['ing處理中'];
				const filtered = prev.filter((msg) => msg !== 'ing處理中');
				return [...filtered, `${content}`, 'ing處理中'];
			});
			return;
		}
	};

	return { messages, handleMessage };
}
