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
import io
# from gpiozero import PWMOutputDevice, Device

root = os.path.normpath(os.path.dirname(__file__))
path = os.path.join(root, 'key.json')
cred = credentials.Certificate(path)
admin.initialize_app(cred)



# SETUP CAMERA
camera = cv2.VideoCapture(0)
w, h = 1280, 720
camera.set(3, w)
camera.set(4, h)

# pin = 23

# servo = PWMOutputDevice(pin)
# servo.on()

# d = Device(pin)

# servo_position = 0


def require_firebase_auth(handler_class):
    def wrap_execute(handler_execute):
        def serve_error(handler, status):
            handler._transforms = []  # necessary
            handler.set_status(status)
            handler.finish()

        def _execute(self, transforms, *args, **kwargs):
            token = self.request.headers.get('Authorization')

            if token is None:
                return serve_error(self, 403)

            token = token.split(" ")[1]
            decoded_token = auth.verify_id_token(token)

            if decoded_token is None:
                return serve_error(self, 403)
            
            if(decoded_token["authorized"] is True or decoded_token["admin"] is True):
                return handler_execute(self, transforms, *args, **kwargs)

        return _execute

    handler_class._execute = wrap_execute(handler_class._execute)

    return handler_class

class WebSocket(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def on_message(self, message):
        # message should be read_{{TOKEN}}
        msg = json.loads(message)
        if msg['read']:
            token = msg['token']
            try:
                decodedToken = auth.verify_id_token(token)
                if decodedToken['admin'] is True or decodedToken['authorized'] is True:
                    self.camera_loop = PeriodicCallback(self.loop, 10)
                    self.camera_loop.start()
            except:
                print("Unauthorized")

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

# @require_firebase_auth
# class MoveLeftHandler(tornado.web.RequestHandler):
#     def post(self, **kwargs):
#         servo_position++
#         servo.value = servo_position

# @require_firebase_auth
# class MoveRightHandler(tornado.web.RequestHandler):
#     def post(self, **kwargs):
#         servo_position--
#         servo.value = servo_position


# handlers = [(r"/camera", WebSocket), (r"/right", MoveRightHandler),
#             (r"/left", MoveLeftHandler)]

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
