#!/usr/bin/env python3

import json
import requests

API_URL = "http://localhost:8080/api"

with open("minecraft_board_pinterest.json") as f:
  pins = json.load(f)

for pin in pins:
  image_url = pin["image"]["original"]["url"]
  source_url = pin["original_link"]

  r = requests.post(API_URL, data={
    "imageURL": image_url, 
    "sourceURL": source_url
  })