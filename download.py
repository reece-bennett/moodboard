#!/usr/bin/env python3

import json
import requests
from urllib.parse import urlparse
from pathlib import Path

image_directory = Path("C:/Users/Reece/Coding/react-moodboard/public/images")

with open("minecraft_board_pinterest.json") as f:
  pins = json.load(f)

for pin in pins:
  image_url = pin["image"]["original"]["url"]
  name = Path(urlparse(image_url).path).name
  
  print(image_directory / name)

  with open(image_directory / name, "wb") as handle:
    response = requests.get(image_url, stream=True)
    
    if not response.ok:
      print(response)
    else:
      for block in response.iter_content(1024):
        if not block:
          break
          
        handle.write(block)