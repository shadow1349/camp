import cv2
from PIL import Image
import tornado.web
import tornado.websocket
from tornado.ioloop import PeriodicCallback
import firebase_admin as admin
from firebase_admin import credentials
from firebase_admin import auth
import base64
import os
import json

root = os.path.normpath(os.path.dirname(__file__))
path = os.path.join(root, 'key.json')
cred = credentials.Certificate(path)
admin.initialize_app(cred)

try:
    import cStringIO as io
except ImportError:
    import io

# SETUP CAMERA
camera = cv2.VideoCapture(0)
w,h = 1280, 720
camera.set(3, w)
camera.set(4, h)

class WebSocket(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def on_message(self, message):
        # message should be read_{{TOKEN}}
        msg = json.loads(message)
        print("MESSAGE: ", msg)
        if msg['read']:
            token = msg['token']
            try:
                print("TOKEN: ", token)
                decodedToken = auth.verify_id_token(token)
                print("DECODED: ", decodedToken)
                if decodedToken['admin'] == True or decodedToken['authorized'] == True :
                    self.camera_loop = PeriodicCallback(self.loop, 10)
                    self.camera_loop.start()
            except:
                print("Unauthorized")
        # self.camera_loop = PeriodicCallback(self.loop, 10)
        # self.camera_loop.start()
            
    def loop(self):
        sio = io.BytesIO()

        _, frame = camera.read()
        frame = cv2.flip(frame, 1)
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

# cap = cv2.VideoCapture(0)

# currentFrame = 0
# while(True):
#     sio = io.BytesIO()
#     # Capture frame-by-frame
#     _, frame = cap.read()

#     # Handles the mirroring of the current frame
#     frame = cv2.flip(frame,1)
#     print("FRAME: ", frame)
#     img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
#     print("IMG: ", img)
#     img.save(sio, "JPEG")

#     encoded = base64.b64encode(sio.getvalue())

#     print("ENCODED: ", encoded)
    
#     cv2.imshow('frame',frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

#     # To stop duplicate images
#     currentFrame += 1

# # When everything done, release the capture
# cap.release()
# cv2.destroyAllWindows()