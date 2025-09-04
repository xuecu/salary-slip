const apiUrl = 'https://salary-clip-proxy-server.zeabur.app/api';

function buildQuery(data) {
	return Object.keys(data)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');
}

async function SendRequest(method, data = {}, options = {}) {
	try {
		let response;

		if (method === 'GET') {
			const url = `${apiUrl}?${buildQuery(data)}`;
			response = await fetch(url, { method: 'GET' });
		} else if (method === 'POST') {
			if (options.form === true) {
				// 使用 FormData 格式
				const formData = new FormData();

				Object.entries(data).forEach(([key, value]) => {
					if (Array.isArray(value)) {
						if (key === 'data') {
							value.forEach((item) => {
								formData.append('file', item, item.name || 'upload.pdf'); // ✅ GAS 要吃這個
							});
						} else {
							value.forEach((item, i) => {
								formData.append(`${key}${i}`, item, item.name || undefined);
							});
						}
					} else {
						formData.append(key, value);
					}
				});

				response = await fetch(apiUrl, {
					method: 'POST',
					body: formData, // ❗不能加 Content-Type，瀏覽器會自動處理邊界
				});
			} else {
				// 使用 JSON 格式
				response = await fetch(apiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});
			}
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
