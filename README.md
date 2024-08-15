# ReactJS Frontend code test

## Setup
1. npm install
2. `npm run dev` to start the project
3. Do some test

## Task 1: Custom CAPTCHA component
1. CAPTCHA validation steps:
    a. The user is presented with the video stream from the selfie camera
    b. There is a square-shaped area inside the video stream which constantly changes
    its location with randomized algorithm
    c. The user clicks the “Continue” button to proceed to the next validation step
    d. Once the “Continue” button is clicked, the current location of the square-shaped
    area inside the video stream should be locked and the current image from
    camera should be captured
    e. The next screen presents the captured image from the previous step with the
    locked square area being divided into sectors by several horizontal and vertical
    lines
    f. Half of the sectors in the area (randomly selected) should have watermarks in the
    form of one of the three shapes: triangle, square or circle.
    g. The user is asked to select sectors which contain watermarks with one of the
    chosen shape (triangle, square or circle), this choice is randomized
    h. The user clicks the “Validate” button to proceed to the validation result screen
    i. The validation result screen informs the user whether they passed the CAPTCHA
    test or not

### Requirement 1: I added a fixed sized video frame that will accomodate the camera view of the user and inside I placed a box with random position as showned in the mock up. Once, the continue button is clicked it will then lock the box to it's current position and add shapes based on the mock up provided

2. It is essential to take all the possible measures to make sure that the validation puzzle is
protected from the being resolved by computerized tools and thus it can be reliably used
to tell the humans and computers apart

### Requirement 2: To prevent automation on the custom captcha I lowered down the opacity of the shapes and limit the clicked area within the shapes only

3. The custom CAPTCHA component should have the reasonable automated test
coverage (but it is not required to implement the automated tests which resolve the
puzzle)

### Requirement 3: I created an automation test using python but it is not yet working properly but it will capture the image and detect the position of the shapes with corresponding color described in the instruction (e.g Select all Red Triangle) and it will click the positions and click the validation button

4. It is allowed to improve the styling and overall look of the custom CAPTCHA component
as long as it is still within the guidelines provided in the Mockups

### Requirement 4: I added a random color to each shape and change the opacity. Also, the rquirements for adding a vertical and horizontal lines inside the box is also implemented
