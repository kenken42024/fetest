import { useState, useEffect, useRef } from 'react';
import '../App.css';

function Captcha({handleValidated})	 {
	// const [mouseMovement, setMouseMovement] = useState(0);
    const [isScreenshotTaken, setIsScreenshotTaken] = useState(false);
    const videoRef = useRef(null);
    const randomBoxRef = useRef(null);
    const screenshotCanvasRef = useRef(null);
	const [pointsLocation, setPointsLocation] = useState([])
	const [clickedPoints, setClickedPoints] = useState([])
	const [xClickedPoints, setXClickedPoints] = useState([])
	const [attempts, setAttempts] = useState(0);
	const [maxAttempts, setMaxAttempts] = useState(3); // Maximum allowed attempts
	const [isValidated, setIsValidated] = useState(null)

	useEffect(() => {
		// Allow camera to start video stream for screenshot use
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
            console.error('Camera error');
        }
		
		positionRandomBox(randomBox);

		const canvas = document.getElementById('screenshotCanvas');

        // // Function to handle mouse movement
        // function handleMouseMove(event) {
        //     // Get the mouse position relative to the canvas
        //     const rect = canvas.getBoundingClientRect();
        //     const x = event.clientX - rect.left;
        //     const y = event.clientY - rect.top;

		// 	setMouseMovement({x, y})
        // }

        // // Attach the event listener to the canvas
        // canvas.addEventListener('mousemove', handleMouseMove);
	}, [])

	useEffect(() => {
		// Stop Camera if the screenshot is taken
		if(isScreenshotTaken) {
			const video = videoRef.current
			if (video && video.srcObject) {
				video.srcObject.getTracks().forEach(track => track.stop());
			}
		}

        // Set interval to reposition the box if screenshot not taken
        const intervalId = setInterval(() => {
            if (!isScreenshotTaken) {
				const video = videoRef.current;
                positionRandomBox(randomBox);
            } else {
				clearInterval(intervalId); // Stop the interval when screenshot is taken
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
	}, [isScreenshotTaken])

	useEffect(() => {
		handleValidated(isValidated, maxAttempts, attempts)
	}, [attempts])

	const addShapes = () => {
        const randomBox = document.getElementById('randomBox');
        randomBox.innerHTML = '';

        const shapes = ['circle', 'triangle', 'square'];
        const colors = ['red', 'blue', 'green']; // Add more colors if needed

        // Randomly choose the target shape and color for the CAPTCHA
        const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];

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

			// Update the instruction text to reflect the selected shape and color
			const instruction = document.getElementById('instruction');
			const color = document.getElementById('color');
			const shape = document.getElementById('shape');
			instruction.textContent = `Select all the `;
			color.textContent = `${targetColor.toUpperCase()}`;
			shape.textContent = `${targetShape.toUpperCase()}`;
			
			// Store the target shape and color for validation
			window.targetShape = targetShape;
			window.targetColor = targetColor;
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

        randomBox.style.left = `${randomX}px`;
        randomBox.style.top = `${randomY}px`;
    };

	const takeScreenshot = () => {
		addShapes();

		const video = videoRef.current;
		const randomBox = randomBoxRef.current;
		const screenshotCanvas = screenshotCanvasRef.current;
	
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;
	
		const videoRect = video.getBoundingClientRect();
	
		// Set canvas size to match video size
		screenshotCanvas.width = videoWidth;
		screenshotCanvas.height = videoHeight;
	
		// Draw the video frame to canvas
		const ctx = screenshotCanvas.getContext('2d');
		ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

		// Draw the shapes from randomBox
		const shapes = randomBox.querySelectorAll('.shape');
		shapes.forEach(shape => {
			const style = window.getComputedStyle(shape);
			const shapeType = shape.classList.contains('triangle') ? 'triangle' :
							  shape.classList.contains('circle') ? 'circle' :
							  shape.classList.contains('square') ? 'square' : null;
	
			// Get x and y axis relative to randomBox position within the video frame
			const shapeRect = shape.getBoundingClientRect();
			const offsetX = (shapeRect.x) - (videoRect.x);
			const offsetY = (shapeRect.y) - (videoRect.y);
	
			// Convert to canvas coordinates and add a gap relative to the video frame
			const x = offsetX + 20
			const y = offsetY + 20
	
			let size, color;
			if (shapeType === 'triangle') {
				size = parseInt(style.borderBottomWidth, 10); // Triangle height from border-bottom
				color = style.borderBottomColor;
				drawTriangle(ctx, x, y, size / 2, color);
			} else if (shapeType === 'circle') {
				size = parseInt(style.width, 10); // Circle radius from width
				color = style.backgroundColor;
				drawCircle(ctx, x, y, size / 2, color);
			} else if (shapeType === 'square') {
				size = parseInt(style.width, 10); // Square size from width
				color = style.backgroundColor;
				drawSquare(ctx, x, y, size, color);
			}

			const getColorInRGB = (colorName) => {
				const colorMap = {
					"blue": "rgb(0, 0, 255)",
					"red": "rgb(255, 0, 0)",
					"green": "rgb(0, 128, 0)"
					// Add more colors if needed
				};
				
				return colorMap[colorName.toLowerCase()] || null;
			};

			const currentColor = document.getElementById('color').innerText;
			const currentColorRGB = getColorInRGB(currentColor);
			const currentShape = document.getElementById('shape').innerText

			// Check if the current shape matches the selected shape type and color
			console.log(currentColor.toLowerCase(), currentShape.toLowerCase())
			if (shapeType === currentShape.toLowerCase() && color === currentColorRGB) {
				console.log(x, y);
				setPointsLocation(prevPoints => [...prevPoints, {type: currentShape.toLowerCase(), size: size, x, y }]);
			}
		});
	
		setIsScreenshotTaken(true);
	};

	const drawTriangle = (ctx, x, y, size, color) => {
		ctx.save(); // Save the current context state
		ctx.globalAlpha = 0.5; // Set opacity to 50%
		ctx.beginPath();
		ctx.moveTo(x, y - size);
		ctx.lineTo(x - size, y + size);
		ctx.lineTo(x + size, y + size);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore(); // Restore the context state
	};
	
	const drawCircle = (ctx, x, y, radius, color) => {
		ctx.save(); // Save the current context state
		ctx.globalAlpha = 0.5; // Set opacity to 50%
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore(); // Restore the context state
	};
	
	const drawSquare = (ctx, x, y, size, color) => {
		ctx.save(); // Save the current context state
		ctx.globalAlpha = 0.5; // Set opacity to 50%
		ctx.fillStyle = color;
		ctx.fillRect(x - size / 2, y - size / 2, size, size);
		ctx.restore(); // Restore the context state
	};

	const handleCanvasClick = (event) => {
		const canvas = screenshotCanvasRef.current;
		const rect = canvas.getBoundingClientRect();
		
		// Calculate the x and y coordinates of the click relative to the canvas
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const clickedPoint = { x, y };

		console.log('Clicked position:', clickedPoint);

		// Check if the clicked point is within any shape in pointsLocation
		const shapeClicked = pointsLocation.find(shape => {
			if (shape.type === 'square') {
				return isPointInSquare(clickedPoint, shape);
			} 
			else if (shape.type === 'circle') {
				return isPointInCircle(clickedPoint, shape);
			} 
			else if (shape.type === 'triangle') {
				return isPointInTriangle(clickedPoint, shape);
			}
			return false;
		});

		const ctx = canvas.getContext('2d');

		// Draw a circle at the mouse position
		ctx.beginPath();
		ctx.arc(x, y, 10, 0, 2 * Math.PI);
		ctx.fillStyle = 'orange';
		ctx.fill();
		
		if (shapeClicked) {
			let  temp = [...clickedPoints]
			const alreadySelected = clickedPoints.find(shape => {
				if (shape.x === shapeClicked.x && shape.y === shapeClicked.y) {
					return true
				} 
				return false;
			});

			if(!alreadySelected) {
				temp.push(shapeClicked)
				setClickedPoints(temp)
			}
		} else {
			let temp = [...xClickedPoints]

			temp.push(clickedPoint)
			setXClickedPoints(temp)
		}
	};

	const isPointInSquare = (point, shape) => {
		const halfSize = shape.size / 2;
		return (
			point.x >= shape.x - halfSize &&
			point.x <= shape.x + halfSize &&
			point.y >= shape.y - halfSize &&
			point.y <= shape.y + halfSize
		);
	};
	
	const isPointInCircle = (point, shape) => {
		const distance = Math.sqrt(
			Math.pow(point.x - shape.x, 2) + Math.pow(point.y - shape.y, 2)
		);
		return distance <= shape.size;
	};
	
	const isPointInTriangle = (point, shape) => {
		const { x, y, size } = shape;
	
		// Calculate the vertices of the equilateral triangle
		const height = Math.sqrt(3) / 2 * size;
		const x1 = x - size / 2;
		const y1 = y + height / 2;
		const x2 = x + size / 2;
		const y2 = y + height / 2;
		const x3 = x;
		const y3 = y - height / 2;
	
		// Calculate the area of the triangle
		const areaOrig = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
		
		let area1 = 0
		let area2 = 0
		let area3 = 0
		// Calculate the areas of the triangles formed by the point and each pair of vertices
		area1 = Math.abs((point.x * (y2 - y3) + x2 * (y3 - point.y) + x3 * (point.y - y2)) / 2);
		area2 = Math.abs((x1 * (point.y - y3) + point.x * (y3 - y1) + x3 * (y1 - point.y)) / 2);
		area3 = Math.abs((x1 * (y2 - point.y) + x2 * (point.y - y1) + point.x * (y1 - y2)) / 2);
		
		console.log((area1 + area2 + area3).toFixed(0), areaOrig)
		// Check if the point is inside the triangle
		return (area1 + area2 + area3).toFixed(0) === areaOrig.toFixed(0);
	};

    const validateCaptcha = () => {
		const result = document.getElementById('result');
		const blockUntilCookie = getCookie('blockUntil');
		let blockUntil = blockUntilCookie ? new Date(blockUntilCookie) : null;
		let attemp = attempts
	
		// Check if the user is currently blocked
		if (blockUntil && new Date() < blockUntil) {
			result.textContent = `You are blocked! Try again after ${new Date(blockUntil).toLocaleTimeString()}.`;
			result.style.color = 'orange';
			return;
		}
	
		if (clickedPoints.length > 0 && clickedPoints.length === pointsLocation.length && xClickedPoints.length <= 0) {
			result.textContent = 'CAPTCHA passed!';
			result.style.color = 'green';
			deleteCookie('blockUntil'); // Reset block status on success
			setAttempts(0);
			setIsValidated(1)
		} else {
			attemp++;
			result.textContent = `CAPTCHA failed! Attempt ${attemp}/${maxAttempts}. Try again.`;
			result.style.color = 'red';
	
			if (attemp >= maxAttempts) {
				blockUntil = new Date(new Date().getTime() + 5 * 60 * 1000); // Block for 5 minutes
				setCookie('blockUntil', blockUntil.toUTCString(), 5);
				result.textContent = `CAPTCHA failed! You are blocked for 5 minutes.`;
				result.style.color = 'red';
			}
			setIsValidated(0)

		}
		
		setAttempts(attemp)
	};

	const handleContinue = () => {
		setPointsLocation([])
		const video = videoRef.current
        if (!isScreenshotTaken) {
			takeScreenshot();
			
			// Stop the video stream
			video.srcObject.getTracks().forEach(track => track.stop());
        } else {
			const randomBox = randomBoxRef.current
			randomBox.innerHTML = ""
			navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    video.srcObject = stream;
                })
                .catch((error) => {
                    console.error('Error accessing the camera:', error);
                });

            setIsScreenshotTaken(false);
        }
    };

	const handleRetry = () => {
		// Clear results
		const result = document.getElementById('result');
		result.textContent = '';
		result.style.color = '';

		// Allow camera and clear random box
		const video = videoRef.current
		const randomBox = randomBoxRef.current
		randomBox.innerHTML = ""
		navigator.mediaDevices.getUserMedia({ video: true })
			.then((stream) => {
				video.srcObject = stream;
			})
			.catch((error) => {
				console.error('Error accessing the camera:', error);
			});

		// Clear states
		setClickedPoints([])
		setXClickedPoints([])
		setPointsLocation([])
		setIsScreenshotTaken(false)
		setIsValidated(null)
    };

	// This is for blocking the user for 5 minutes before they can try again
	const setCookie = (name, value, minutes) => {
		const date = new Date();
		date.setTime(date.getTime() + (minutes * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	};

	const getCookie = (name) => {
		const cookieName = name + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookieArray = decodedCookie.split(';');
		for (let i = 0; i < cookieArray.length; i++) {
			let cookie = cookieArray[i].trim();
			if (cookie.indexOf(cookieName) === 0) {
				return cookie.substring(cookieName.length, cookie.length);
			}
		}
		return "";
	};

	const deleteCookie = (name) => {
		document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	};

    return (
        <>	
			<div id="shapeSelector">
                <span id='instruction'>Take a Selfie</span>&nbsp;<span id="color"></span>&nbsp;<span id="shape"></span>
            </div>

			{/* Camera Container for the user to see the position of the box where the shapes should be selected */}
            <div className="camera-container">
				{/* Random Shapes Container */}
				<canvas ref={screenshotCanvasRef} onClick={handleCanvasClick} id="screenshotCanvas" className='screenshot' style={{ 'display': isScreenshotTaken ? 'unset' : 'none' }}></canvas>
				<div className="grid" ref={randomBoxRef} id="randomBox" style={{ display: isScreenshotTaken ? 'none' : ''}}></div>
				{/* <div className="grid" ref={randomBoxRef} id="randomBox"></div> */}
				
				{/* Camera stream */}
                <video ref={videoRef} autoPlay playsInline style={{ 'display': !isScreenshotTaken ? 'unset' : 'none' }}></video>
            </div>

			{
				isScreenshotTaken
				?	<div className='gap-2'>
						{
							isValidated === null && pointsLocation.length > 1
							? <button disabled={clickedPoints.length <= 0 && xClickedPoints.length <= 0 } onClick={validateCaptcha} id="continueButton">Validate</button>
							: 	<>
									<button disabled={clickedPoints.length <= 0 && xClickedPoints.length <= 0 } onClick={validateCaptcha} id="continueButton">Validate</button>&nbsp;
									<button onClick={() => { handleRetry() }} id="continueButton">{ pointsLocation.length > 1 ? "Retry" : "Skip" }</button>
								</>
						}
					</div>
				:	<button onClick={handleContinue} id="continueButton">Continue</button>
			}

			<p id="result"></p>
        </>
    );
}

export default Captcha;
