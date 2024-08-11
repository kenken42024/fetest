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
	const [randomBoxPosX, setRandomBoxPosX] = useState(0)
	const [randomBoxPosY, setRandomBoxPosY] = useState(0)

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

		positionRandomBox(randomBox);
	}, [])

	useEffect(() => {
        // Set interval to reposition the box if screenshot not taken
        const intervalId = setInterval(() => {
            if (!isScreenshotTaken) {
				const video = videoRef.current;
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

        const maxXRange = 255;  // Constrain left to range 0 to 255px
        const maxYRange = 94;   // Constrain top to range 0 to 94px
        const maxX = Math.min(maxXRange, containerWidth - boxWidth);
        const maxY = Math.min(maxYRange, containerHeight - boxHeight);

        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
		
		setRandomBoxPosX(randomX)
		setRandomBoxPosY(randomY)

        randomBox.style.left = `${randomX}px`;
        randomBox.style.top = `${randomY}px`;
    };

	const takeScreenshot = () => {
		const video = videoRef.current;
		const randomBox = randomBoxRef.current;
		const screenshotCanvas = screenshotCanvasRef.current;
	
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;
	
		const randomBoxRect = randomBox.getBoundingClientRect();
		console.log('randomBoxRect >>>', randomBoxRect)
		console.log('')

		const randomBoxWidth = randomBoxRect.width;
		const randomBoxHeight = randomBoxRect.height;

	
		// Set canvas size to match video size
		screenshotCanvas.width = videoWidth;
		screenshotCanvas.height = videoHeight;
	
		// Draw the video frame to canvas
		const ctx = screenshotCanvas.getContext('2d');
		ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
	
		addShapes();
	
		// Draw the shapes from randomBox
		const shapes = randomBox.querySelectorAll('.shape');
		shapes.forEach(shape => {
			const style = window.getComputedStyle(shape);
			const shapeType = shape.classList.contains('triangle') ? 'triangle' :
				shape.classList.contains('circle') ? 'circle' :
				shape.classList.contains('square') ? 'square' : null;

			// Get position relative to randomBox
			const shapeRect = shape.getBoundingClientRect();
			const offsetX = (shapeRect.x) - (randomBoxRect.x);
			const offsetY = (shapeRect.y) - (randomBoxRect.y);

			// Convert to canvas coordinates relative to the video frame
			const x = (offsetX / (randomBoxWidth/16)) * (randomBoxWidth/16) + (randomBoxWidth/16);
			const y = (offsetY / (randomBoxHeight/16)) * (randomBoxHeight/16) + (randomBoxHeight/16);

			// Inverse calculation for centering the axes
			const canvasCenterX = videoWidth;
			const canvasCenterY = videoHeight;
			const inverseX = canvasCenterX + (x - canvasCenterX);
			const inverseY = canvasCenterY + (y - canvasCenterY);

			// Logging the original and inverted coordinates
			console.log('Original Canvas coordinates:', { x, y });
			console.log('Inverse Canvas coordinates:', { inverseX, inverseY });

			let size, color;
			if (shapeType === 'triangle') {
				size = parseInt(style.borderBottomWidth, 10); // Triangle height from border-bottom
				color = style.borderBottomColor;
				drawTriangle(ctx, inverseX, inverseY, size / 2, color);
			} else if (shapeType === 'circle') {
				size = parseInt(style.width, 10); // Circle radius from width
				color = style.backgroundColor;
				drawCircle(ctx, inverseX, inverseY, size / 2, color);
			} else if (shapeType === 'square') {
				size = parseInt(style.width, 10); // Square size from width
				color = style.backgroundColor;
				drawSquare(ctx, inverseX, inverseY, size, color);
			}
		});
	
		setIsScreenshotTaken(true);
	};

	const drawTriangle = (ctx, x, y, size, color) => {
		ctx.beginPath();
		ctx.moveTo(x, y - size);
		ctx.lineTo(x - size, y + size);
		ctx.lineTo(x + size, y + size);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	};
	
	const drawCircle = (ctx, x, y, radius, color) => {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	};
	
	const drawSquare = (ctx, x, y, size, color) => {
		ctx.fillStyle = color;
		ctx.fillRect(x - size / 2, y - size / 2, size, size);
	};

    const addShapes = () => {
        const randomBox = document.getElementById('randomBox');
        randomBox.innerHTML = '';

        const shapes = ['circle', 'triangle', 'square'];
        const colors = ['red', 'blue', 'green']; // Add more colors if needed

        // Randomly choose the target shape and color for the CAPTCHA
        const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];

        setShapeToSelect(targetShape);
        setColorToSelect(targetColor);

        // Update the instruction text to reflect the selected shape and color
        const instruction = document.getElementById('instruction');
        instruction.textContent = `Select all the ${targetColor} ${targetShape}s:`;

        // Randomly assign shapes and colors to the 4x4 grid
        for (let i = 0; i < 16; i++) { // 4x4 grid means 16 items
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const shapeElement = document.createElement('div');
            shapeElement.classList.add('shape', randomShape);
            if(randomShape === 'triangle') {
				shapeElement.style.borderBottom = "40px solid "+randomColor;
			} else {
				shapeElement.style.backgroundColor = randomColor;
			}
            shapeElement.addEventListener('click', function () {
                shapeElement.classList.toggle('selected');
            });
            randomBox.appendChild(shapeElement);
        }

        // Store the target shape and color for validation
        window.targetShape = targetShape;
        window.targetColor = targetColor;
    };

    const validateCaptcha = () => {
        const selectedShapes = document.querySelectorAll(`.shape.selected.${window.targetShape}`);
        const allTargetShapes = document.querySelectorAll(`.${window.targetShape}`);
        const result = document.getElementById('result');

        // Filter shapes by the target color
		const selectedShapesFiltered = Array.from(selectedShapes).filter(shape => {
			// Check if the shape is a triangle or not
			if (shape.classList.contains('triangle')) {
				// For triangles, color is in the borderBottom style property
				return shape.style.borderBottom === colorToSelect;
			} else {
				// For other shapes, color is in the backgroundColor style property
				return shape.style.backgroundColor === colorToSelect;
			}
		});

		const allTargetShapesFiltered = Array.from(allTargetShapes).filter(shape => {
			// Check if the shape is a triangle or not
			if (shape.classList.contains('triangle')) {
				// For triangles, color is in the borderBottom style property
				return shape.style.borderBottom === colorToSelect;
			} else {
				// For other shapes, color is in the backgroundColor style property
				return shape.style.backgroundColor === colorToSelect;
			}
		});

        if (
            selectedShapesFiltered.length === allTargetShapesFiltered.length &&
            selectedShapesFiltered.length > 0
        ) {
            result.textContent = 'CAPTCHA passed!';
            result.style.color = 'green';
        } else if (selectedShapesFiltered.length !== allTargetShapesFiltered.length) {
            if (selectedShapesFiltered.length > 0) {
                result.textContent = 'CAPTCHA failed! Try again.';
                result.style.color = 'red';
                addShapes();
            }
        }
    };

	const handleBoxClick = (event) => {
		console.log(randomBoxRef)
		const rect = document.getElementById('randomBox').getBoundingClientRect();

		// Calculate the x and y coordinates of the click relative to the canvas
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const clickedPoint = { x, y };

		console.log('clicked point >>>', clickedPoint)
	}

	const handleCanvasClick = (event) => {
		const canvas = screenshotCanvasRef.current;
		const rect = canvas.getBoundingClientRect();

		// Calculate the x and y coordinates of the click relative to the canvas
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const clickedPoint = { x, y };

		console.log('Clicked position:', clickedPoint);

		// // Check if the clicked point is within any shape in pointsLocation
		// const shapeClicked = pointsLocation.find(shape => {
		// 	if (shape.type === 'square') {
		// 		console.log('1 >>>', shape)
		// 		return isPointInSquare(clickedPoint, shape);
		// 	} 
		// 	else if (shape.type === 'circle') {
		// 		console.log('2 >>>', shape)
		// 		return isPointInCircle(clickedPoint, shape);
		// 	} 
		// 	else if (shape.type === 'triangle') {
		// 		console.log('3 >>>', shape)
		// 		return isPointInTriangle(clickedPoint, shape);
		// 	}
		// 	return false;
		// });

		// if (shapeClicked) {
		// 	console.log('Clicked inside a shape:', shapeClicked);
		// 	// Do something, e.g., mark the shape as selected
		// } else {
		// 	console.log('Clicked outside of all shapes.');
		// }
	};

    return (
        <>	
			<div ref={shapeSelectorRef} id="shapeSelector" style={{ 'display': isScreenshotTaken ? 'unset' : 'none' }}>
                <label id='instruction'></label>
            </div>

			{/* Camera Container for the user to see the position of the box where the shapes should be selected */}
            <div className="camera-container">
				{/* Random Shapes Container */}
				<canvas ref={screenshotCanvasRef} id="screenshotCanvas" className='screenshot' onClick={handleCanvasClick} style={{ 'display': isScreenshotTaken ? 'unset' : 'none' }}></canvas>
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
