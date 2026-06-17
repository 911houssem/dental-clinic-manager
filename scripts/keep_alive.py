#!/usr/bin/env python3
"""
سكريبت keep-alive لـ HF Space
يطلب الموقع كل 5 دقائق عشان ما يدخل في وضع sleep.

التشغيل في الخلفية:
    nohup python3 keep_alive.py > keep_alive.log 2>&1 &

أو إيقافه:
    pkill -f keep_alive.py
"""

import time
import urllib.request
import urllib.error
from datetime import datetime

URL = "https://houssem9-dental-clinic-manager.hf.space/api/subscriptions"
INTERVAL = 300  # 5 دقائق

def ping():
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "KeepAlive/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return str(e)

print(f"Keep-alive started at {datetime.now()}")
print(f"Pinging {URL} every {INTERVAL}s")
print()

while True:
    status = ping()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Status: {status}")
    time.sleep(INTERVAL)
