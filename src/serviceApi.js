const apiUrl =
	'https://script.google.com/macros/s/AKfycbxYQLmalCPXJ0BvCRU6Pl0ispnttIcs0vnfUTjdSOWbVtQXsVhKML9_P0dbDhZpC6fg/exec';

async function SendRequest(method, data) {
	const query = (data) =>
		Object.keys(data)
			.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
			.join('&');

	try {
		let response;

		if (method === 'POST') {
			response = await fetch(apiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		} else if (method === 'GET') {
			const url = `${apiUrl}?${query(data)}`;
			response = await fetch(url, { method: 'GET' });
		} else {
			console.warn(`Unsupported method: ${method}`);
			return { success: false, message: '不支援的 API 方法' };
		}

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('API 錯誤:', error);
		return { success: false, message: error.message };
	}
}

export default SendRequest;
