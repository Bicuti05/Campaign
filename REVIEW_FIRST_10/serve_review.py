"""Serve the review; logs stay local so a closed tool pipe cannot break replies."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
ThreadingHTTPServer(('0.0.0.0',8765),partial(Handler,directory=str(Path(__file__).resolve().parent))).serve_forever()
