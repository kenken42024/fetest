import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
	const [mouseMovement, setMouseMovement] = useState(0);
    const [shapeToSelect, setShapeToSelect] = useState('');
    const [colorToSelect, setColorToSelect] = useState('');
    const [isScreenshotTaken, setIsScreenshotTaken] = useState(false);
    const videoRef = useRef(null);
    const randomBoxRef = useRef(null);
    const screenshotCanvasRef = useRef(null);
    const shapeSelectorRef = useRef(null);

	useEffect(() => {
		const video = document.getElementById('camera');
		const screenshotCanvas = document.getElementById('screenshotCanvas');
		
		// Access the camera
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

		positionRandomBox();
	}, [])

	useEffect(() => {
        // Set interval to reposition the box if screenshot not taken
        const intervalId = setInterval(() => {
            if (!isScreenshotTaken) {
                positionRandomBox();
            } else {
                clearInterval(intervalId); // Stop the interval when screenshot is taken
            }
        }, 3000);

        // Clear interval once screenshot is taken
        return () => {
            clearInterval(intervalId);
        };
	}, [isScreenshotTaken])

	const positionRandomBox = () => {
		const randomBox = document.getElementById('randomBox');
		// const continueButton = document.getElementById('continueButton');

        const container = document.querySelector('.camera-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const boxWidth = randomBox.offsetWidth;
        const boxHeight = randomBox.offsetHeight;

        const maxXRange = 255;
        const maxYRange = 94;

        const maxX = Math.min(maxXRange, containerWidth - boxWidth);
        const maxY = Math.min(maxYRange, containerHeight - boxHeight);

        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        randomBox.style.left = `${randomX}px`;
        randomBox.style.top = `${randomY}px`;
    }

    // Function to draw random shapes on the canvas within the box
    const drawShapes = () => {
		const video = videoRef.current
		const randomBox = randomBoxRef.current
		const videoRect = randomBox.getBoundingClientRect()
		const randomBoxRect = randomBox.getBoundingClientRect()
		const maxXRange = 255;
        const maxYRange = 94;
		
		console.log('random box >>>', randomBoxRect)

        const videoWidth = randomBoxRect.width;
        const videoHeight = randomBoxRect.height;

        const boxWidth = randomBoxRect.width;
        const boxHeight = randomBoxRect.height;

		const maxX = Math.min(maxXRange, videoWidth - boxWidth);
        const maxY = Math.min(maxYRange, videoHeight - boxHeight);

        const shapeSize = Math.min(boxWidth / 4, boxHeight / 4); // Size of each shape in 4x4 grid
		const ctx = screenshotCanvas.getContext('2d');

        ctx.clearRect(0, 0, boxWidth, boxHeight); // Clear previous drawings

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * shapeSize;
                const y = row * shapeSize;

                ctx.beginPath();
                ctx.moveTo(x + shapeSize / 2, y);
                ctx.lineTo(x + shapeSize, y + shapeSize);
                ctx.lineTo(x, y + shapeSize);
                ctx.closePath();
                ctx.fillStyle = getRandomColor();
                ctx.fill();
            }
        }
    }

    // Function to get a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Function to take a screenshot
    const takeScreenshot = () => {
		const video = document.getElementById('camera');
		const shapeSelector = document.getElementById('shapeSelector');
		const selectedShapeText = document.getElementById('instruction');

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set canvas size to match video size
        screenshotCanvas.width = videoWidth;
        screenshotCanvas.height = videoHeight;

        // Draw the video frame to canvas
        const ctx = screenshotCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        // Display shape selector
        shapeSelector.style.display = 'block';

        // Draw shapes in the random box
        drawShapes();

        // Set the shape selector text to "Triangle"
        selectedShapeText.textContent = 'Triangle';
		setIsScreenshotTaken(true)
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
				<div className="grid" ref={randomBoxRef} id="randomBox"></div>
				
				{/* Camera stream */}
                <video ref={videoRef} id='camera' autoPlay playsInline style={{ 'display': !isScreenshotTaken ? 'unset' : 'none' }}></video>
            </div>

			{
				isScreenshotTaken
				?	<button id="continueButton">Validate</button>
				:	<button onClick={takeScreenshot} id="continueButton">Continue</button>
			}

			<p id="result"></p>
        </>
    );
}

export default App;
