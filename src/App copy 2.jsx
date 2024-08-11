import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
	const [mouseMovement, setMouseMovement] = useState(0);
    const [shapeToSelect, setShapeToSelect] = useState('');
    const [isScreenshotTaken, setIsScreenshotTaken] = useState(false);
    const videoRef = useRef(null);
    const randomBoxRef = useRef(null);
    const screenshotCanvasRef = useRef(null);
    const shapeSelectorRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
        const randomBox = randomBoxRef.current;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    video.srcObject = stream;
                })
                .catch((error) => {
                    console.error('Error accessing the camera:', error);
                });
        } else {
            console.error('getUserMedia not supported');
        }
	}, [])

	useEffect(() => {
        // Set interval to reposition the box if screenshot not taken
        const intervalId = setInterval(() => {
            if (!isScreenshotTaken) {
                positionRandomBox(randomBox);
            } else {
                clearInterval(intervalId); // Stop the interval when screenshot is taken
            }
        }, 3000);

        // Clear interval once screenshot is taken
        return () => {
            clearInterval(intervalId);
        };
	}, [isScreenshotTaken])

	const handleContinue = () => {
        if (!isScreenshotTaken) {
			takeScreenshot();
            setIsScreenshotTaken(true);
        } else {
            alert(`Please select the ${shapeToSelect}`);
        }
    };

	const positionRandomBox = (randomBox) => {
        const container = document.querySelector('.camera-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const boxWidth = randomBox.offsetWidth;
        const boxHeight = randomBox.offsetHeight;

        // Set the max offset range for the box to maintain within the camera container
        const maxXRange = 255;
        const maxYRange = 94;

		
        // Calculate max position based on constraints
        const maxX = Math.min(maxXRange, containerWidth - boxWidth);
        const maxY = Math.min(maxYRange, containerHeight - boxHeight);
		
		console.log('width >>>', boxWidth, containerWidth)
		console.log('height >>>', boxHeight, containerHeight)
        // Generate random positions within the constrained range
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        randomBox.style.left = `${randomX}px`;
        randomBox.style.top = `${randomY}px`;
    };

	const addShapes = () => {
		const randomBox = document.getElementById('randomBox');
		randomBox.innerHTML = ''
		
		const shapes = ['circle', 'triangle', 'square'];
		const grid = document.querySelector('.grid');

		// Randomly choose the target shape for the CAPTCHA
		// const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
		const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
		setShapeToSelect(targetShape)

		// Update the instruction text to reflect the selected shape
		const instruction = document.getElementById('instruction');
		instruction.textContent = `Select all the ${targetShape.toUpperCase()}s`;

		// Randomly assign shapes to the 4x4 grid
		for (let i = 0; i < 16; i++) { // 4x4 grid means 16 items
			const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
			const shapeElement = document.createElement('div');
			shapeElement.classList.add('shape', randomShape);
			shapeElement.addEventListener('click', function() {
				shapeElement.classList.toggle('selected');
			});
			grid.appendChild(shapeElement);
		}

		// Store the target shape for validation
		window.targetShape = targetShape;
	}

	const takeScreenshot = () => {
        const video = videoRef.current;
        const screenshotCanvas = screenshotCanvasRef.current;
        const randomBox = randomBoxRef.current;
		
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set canvas size to match video size
        screenshotCanvas.width = videoWidth;
        screenshotCanvas.height = videoHeight;

        // Draw the video frame to canvas
        const ctx = screenshotCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

		addShapes()
    };

	const validateCaptcha = () => {
		const selectedShapes = document.querySelectorAll(`.shape.selected.${window.targetShape}`);
		const allTargetShapes = document.querySelectorAll(`.${window.targetShape}`);
		const result = document.getElementById('result');

		console.log(selectedShapes)
		
		if (selectedShapes.length === allTargetShapes.length && selectedShapes.length > 0) {
			result.textContent = "CAPTCHA passed!";
			result.style.color = "green";
		} 
		else if(selectedShapes.length !== allTargetShapes.length) {
			if(selectedShapes.length > 0) {
				result.textContent = "CAPTCHA failed! Try again.";
				result.style.color = "red";
				addShapes()
			}
		}
	}

	const handleBoxClick = () => {
		console.log(randomBoxRef)
	}

    return (
        <>	
			<div ref={shapeSelectorRef} id="shapeSelector" style={{ 'display': isScreenshotTaken ? 'unset' : 'none' }}>
                <label id='instruction'></label>
            </div>

			{/* Camera Container for the user to see the position of the box where the shapes should be selected */}
            <div className="camera-container">
				{/* Random Shapes Container */}
				<canvas ref={screenshotCanvasRef} id="screenshotCanvas" className='screenshot' style={{ 'display': isScreenshotTaken ? 'unset' : 'none' }}></canvas>
				<div className="grid" ref={randomBoxRef} id="randomBox" onClick={handleBoxClick}></div>
				
				{/* Camera stream */}
                <video ref={videoRef} autoPlay playsInline style={{ 'display': !isScreenshotTaken ? 'unset' : 'none' }}></video>
            </div>

			{
				isScreenshotTaken
				?	<button onClick={validateCaptcha} id="continueButton">Validate</button>
				:	<button onClick={handleContinue} id="continueButton">Continue</button>
			}

			<p id="result"></p>
        </>
    );
}

export default App;
