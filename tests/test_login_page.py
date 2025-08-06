from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

def get_driver():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get("http://localhost:5173")
    return driver

def test_login_page_loads():
    driver = get_driver()
    
    assert "Quest Manager" in driver.title
    
    driver.quit()

def test_login_form_elements_exist():
    driver = get_driver()
    def get_element(by, value):
      e = driver.find_element(by, value)
      assert e is not None
      return e

    get_element(By.CLASS_NAME, 'google-login')
    demo_button = get_element(By.CLASS_NAME, 'demo-login')
    demo_button.click()
    char_man_btn = get_element(By.XPATH, "//a[@href='/character-manager']//img[@class='banner-button']")
    char_man_btn.click()
    assert "/character-manager" in driver.current_url
    
    driver.quit()