import { useState, useEffect, useRef } from 'react';
import Captcha from './components/captcha';
import Result from './components/results';
import './App.css';

function App() {
	const [result, setResult] = useState(null)
	const [attempts, setAttempts] = useState(0);
	const [maxAttempts, setMaxAttempts] = useState(3); // Maximum allowed attempts
	const handleResults = () => {
		console.log('validated')
	}

	const handleValidation = (v, max, n) => {
		console.log('app result >>>', v, max, n)
		setResult(v)
		setMaxAttempts(max)
		setAttempts(n)
	}

	const handleRetry = () => {
		setResult(null)
	}

    return (
        <>	
			{
				result !== null
				? 	<Result 
						result={result}
						maxAttempts={maxAttempts}
						attempts={attempts}
						handleRetry={handleRetry}
					/>
				:	<Captcha
						handleResults={handleResults} 
						handleValidated={handleValidation}
					/>
			}
        </>
    );
}

export default App;
