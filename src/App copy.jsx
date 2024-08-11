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

        // Position the box randomly initially
        positionRandomBox(randomBox);
    }, []);

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

        // Generate random positions within the constrained range
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        randomBox.style.left = `${randomX}px`;
        randomBox.style.top = `${randomY}px`;
    };

    const takeScreenshot = () => {
        const video = videoRef.current;
        const screenshotCanvas = screenshotCanvasRef.current;
        const shapeSelector = shapeSelectorRef.current;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set canvas size to match video size
        screenshotCanvas.width = videoWidth;
        screenshotCanvas.height = videoHeight;

        // Draw the video frame to canvas
        const ctx = screenshotCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        // Hide the video and display the screenshot
        video.style.display = 'none';
        screenshotCanvas.style.display = 'auto';

        // Display the shape selector
        shapeSelector.style.display = 'block';

        // Draw shapes in the random box and set the shape to select
        const shape = getRandomShape();
        setShapeToSelect(shape);
        drawShapes(shape);
    };

	const drawShapes = (shapeType) => {
		const shapes = ['circle', 'triangle', 'square'];
		const grid = document.querySelector('.grid');
		
		// Randomly choose the target shape for the CAPTCHA
		const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
		
		// Update the instruction text to reflect the selected shape
		const instruction = document.getElementById('instruction');
		instruction.textContent = `Select all the ${targetShape}s:`;

		// Randomly assign shapes to the 3x3 grid
		for (let i = 0; i < 9; i++) {
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
    };

	const handleContinue = () => {
        if (!isScreenshotTaken) {
            takeScreenshot();
            setIsScreenshotTaken(true);
        } else {
            alert(`Please select the ${shapeToSelect}`);
        }
    };

	const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const getRandomShape = () => {
        const shapes = ['Triangle', 'Circle', 'Square'];
        setShapeToSelect(shapes[Math.floor(Math.random() * shapes.length)]);
    };

	const validateCaptcha = () => {
		const selectedShapes = document.querySelectorAll(`.shape.selected.${window.targetShape}`);
		const allTargetShapes = document.querySelectorAll(`.${window.targetShape}`);
		const result = document.getElementById('result');
		
		if (selectedShapes.length === allTargetShapes.length && selectedShapes.length > 0) {
			result.textContent = "CAPTCHA passed!";
			result.style.color = "green";
		} else {
			result.textContent = "CAPTCHA failed! Try again.";
			result.style.color = "red";
		}
	}

    return (
        <>	
			{/* Camera Container for the user to see the position of the box where the shapes should be selected */}
            <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline></video>

				{/* Random Shapes Container */}
                <div ref={randomBoxRef} id="randomBox"></div>
            </div>
            <button onClick={handleContinue} id="continueButton">Continue</button>
            <canvas ref={screenshotCanvasRef} id="screenshotCanvas" style={{ display: 'none' }}></canvas>
            <div ref={shapeSelectorRef} id="shapeSelector" style={{ display: 'none' }}>
                <label>Select Shape: {shapeToSelect}</label>
            </div>
        </>
    );
}

export default App;
