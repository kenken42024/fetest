# ReactJS Frontend Code Test

## Setup

1. **Install Dependencies**:
   - Run the following command to install all necessary dependencies:
     ```bash
     npm install
     ```

2. **Start the Project**:
   - Use the following command to start the development server:
     ```bash
     npm run dev
     ```

3. **Testing**:
   - Perform tests to ensure the application is working as expected.

## Task 1: Custom CAPTCHA Component

### CAPTCHA Validation Steps

1. **Video Stream and Interactive Area**:
   - Present the user with a video stream from their webcam.
   - Display a square-shaped area within the video stream. This area should continually change its location using a randomized algorithm.

2. **Capture and Validation**:
   - When the user clicks the "Continue" button, lock the position of the square-shaped area and capture the current image from the camera.
   - On the next screen, display the captured image with the locked square area divided into multiple sectors using horizontal and vertical lines.

3. **Watermark Placement and User Interaction**:
   - Randomly place watermarks in the form of one of three shapes (triangle, square, or circle) in half of the sectors within the square area.
   - Randomize the choice of shape that the user needs to select.
   - Provide a "Validate" button for the user to proceed to the validation result screen.

4. **Validation Result**:
   - Display whether the user passed or failed the CAPTCHA test on the validation result screen.

### Requirement 1: Implementation Details

- A fixed-sized video frame accommodates the camera view of the user.
- A box with a random position is placed within the video frame, as depicted in the mockups.
- Once the "Continue" button is clicked, the box's position is locked, and shapes are added according to the mockup.

### Requirement 2: Anti-Automation Measures

- To prevent automated tools from bypassing the CAPTCHA, reduce the opacity of the shapes and restrict the clickable area to within the shapes only.

### Requirement 3: Automated Test Coverage

- Implement reasonable automated test coverage for the custom CAPTCHA component. While resolving the puzzle via automated tests is not required, capturing images and detecting shape positions with the corresponding color should be part of the tests. Note that an automated test using Python is under development, which captures images, detects shapes, and interacts with the CAPTCHA.

### Requirement 4: Styling and Enhancements

- Improve the styling and overall appearance of the custom CAPTCHA component, ensuring it remains consistent with the guidelines provided in the mockups.
- Add random colors to each shape and adjust their opacity.
- Implement vertical and horizontal lines inside the box to enhance the visual presentation.

---