import json

text = json.dumps({"name": "Mia", "active": True})
print(text)
data = json.loads(text)
print(data["active"])
