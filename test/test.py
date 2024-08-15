from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from PIL import Image
import io
import time

# Set up options
options = Options()
options.set_capability("browserName", "chrome")

# Initialize the WebDriver
service = Service('C:/Users/rayen/Documents/Projects/meldcx/test/chromedriver.exe')
driver = webdriver.Chrome(service=service, options=options)

# Open your React app
driver.get('http://localhost:5173/')

# Wait for the page to load and let the user allow the camera 
time.sleep(10)

# Get the desired color and shape from the #color and #shape elements
desired_color = driver.find_element(By.ID, 'color').text.strip()
desired_shape = driver.find_element(By.ID, 'shape').text.strip().lower()

# Convert color text to RGB value
color_mapping = {
    'green': (0, 255, 0),
    'red': (255, 0, 0),
    'blue': (0, 0, 255)
}

desired_color = color_mapping.get(desired_color.lower(), desired_color)

# Capture the canvas screenshot
canvas = driver.find_element(By.ID, 'screenshotCanvas')
canvas_screenshot = canvas.screenshot_as_png

# Convert screenshot to image
image = Image.open(io.BytesIO(canvas_screenshot))

# Function to check if a point's color matches the desired color
def is_color_match(x, y, color):
    pixel_color = image.getpixel((x, y))
    return pixel_color == color

# Define a range for shape detection if necessary
shape_detection_range = 10

# Scan through the canvas image for shapes that match the criteria
matching_points = []
width, height = image.size

for x in range(0, width, shape_detection_range):
    for y in range(0, height, shape_detection_range):
        if is_color_match(x, y, desired_color):
            matching_points.append((x, y))

# Click on matching points on the canvas
for (x, y) in matching_points:
    canvas_location = canvas.location
    canvas_size = canvas.size
    click_x = canvas_location['x'] + x
    click_y = canvas_location['y'] + y
    driver.execute_script(f"document.elementFromPoint({click_x}, {click_y}).click();")  # Click at the position

# Click the "Validate" button
validate_button = driver.find_element(By.ID, 'continueButton')
validate_button.click()

# Wait for the result to update
time.sleep(5)

# Check if the page has "CAPTCHA passed!" message
result_text = driver.find_element(By.ID, 'result').text
if "CAPTCHA passed!" in result_text:
    print("CAPTCHA passed!")
else:
    print("CAPTCHA failed!")

# Keep the browser open for a while to see the result
time.sleep(10)

# Close the browser
driver.quit()
