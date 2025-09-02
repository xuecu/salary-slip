import { Route, Routes } from 'react-router';
import AuthPage from './pages/auth-page';
import ComfirmPage from './pages/comfirm-page';

function App() {
	return (
		<Routes>
			<Route
				path="/:id"
				element={<AuthPage />}
			/>
			{/* 			<Route
				path="/:id/comfirm"
				element={<ComfirmPage />}
			/> */}
		</Routes>
	);
}

export default App;
