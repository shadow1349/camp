import cv2
from PIL import Image
import tornado.web
import tornado.websocket
from tornado.ioloop import PeriodicCallback
import firebase_admin.auth as auth
import base64

try:
    import cStringIO as io
except ImportError:
    import io

# SETUP CAMERA
camera = cv2.VideoCapture()
w,h = 1280, 720
camera.set(3, w)
camera.set(4, h)

class WebSocket(tornado.websocket.WebSocketHandler):

    def on_message(self, message):
        # message should be read_{{TOKEN}}
        if "read" in message:
            token = message.split("_")[1]

            try:
                decodedToken = auth.verify_id_token(token)

                if(decodedToken['admin'] == True):
                    self.camera_loop = PeriodicCallback(self.loop, 10)
                    self.camera_loop.start()
            except auth.AuthError:
                print("Unauthorized")
            
    def loop(self):
        sio = io.StringIO
        _, frame = camera.read()
        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        img.save(sio, "JPEG")

        try:
            self.write_message(base64.b64encode(sio.getvalue()))
        except tornado.websocket.WebSocketClosedError:
            self.camera_loop.stop()

handlers = [(r"/camera", WebSocket)]

application = tornado.web.Application(handlers)
application.listen(8000)

tornado.ioloop.IOLoop.instance().start()