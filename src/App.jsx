import { useState, useEffect } from 'react';
import Captcha from './components/captcha';
import Result from './components/results';
import './App.css';

function App() {
	const [result, setResult] = useState(null)
	const [attempts, setAttempts] = useState(0);
	const [maxAttempts, setMaxAttempts] = useState(3); // Maximum allowed attempts
	const [blocked, setBlocked] = useState(false); 

	useEffect(() => {
		if(attempts >= maxAttempts) {
			setBlocked(true)
			setResult(0)
		} else {
			setBlocked(false)
		}
	}, [attempts])

	const handleValidation = (v, n) => {
		setResult(v)
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
							isBlocked={blocked}
						/>
					:	<Captcha
							handleValidated={handleValidation}
							maxAttempts={maxAttempts}
						/>
			}
        </>
    );
}

export default App;
