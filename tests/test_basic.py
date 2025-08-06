from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def test_can_open_google():
    # Set up the browser
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    # Go to Google
    driver.get("https://www.google.com")
    
    # Check that we're actually on Google
    assert "Google" in driver.title
    
    # Close the browser
    driver.quit()