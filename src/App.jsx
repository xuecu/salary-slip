import { Route, Routes } from 'react-router';
import AuthPage from './pages/auth-page';
import ComfirmPage from './pages/comfirm-page';
import SignPage from './pages/sign-page';
import SignFinish from './pages/sign-finish';

function App() {
	return (
		<Routes>
			<Route
				path="/:id"
				element={<AuthPage />}
			/>
			<Route
				path="/:id/comfirm"
				element={<ComfirmPage />}
			/>
			<Route
				path="/:id/signPDF"
				element={<SignPage />}
			/>
			<Route
				path="/:id/signFinish"
				element={<SignFinish />}
			/>
		</Routes>
	);
}

export default App;
