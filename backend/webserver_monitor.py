import os
os.environ["GEVENT_SUPPORT"] = "True"

from gevent import monkey
monkey.patch_all()

from bottle import Bottle, request, run, static_file, response
import yaml
import json
import time

app = Bottle()

monitor_event =  {}

@app.route('/')
def serve_index():
    return static_file('index.html', root='./build')

@app.route('/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./build')


# for connection with frontend clients
@app.route('/sse', method='GET')
def sse():
    global monitor_event
    print("SSE connection established")

    response.content_type = 'text/event-stream'
    response.cache_control = 'no-cache'
    response.set_header("X-Accel-Buffering", "no")
    send_data = None

    while True:
        print("Sending data:", monitor_event)
        yield f"data: {json.dumps(monitor_event)}\n\n"
        time.sleep(2)  


# Gets called from CPEE
@app.route('/log', method='POST')
def log():

    # Reused from logger assignment
    print("-------------------------")
    notification = json.loads(request.forms['notification'])
    print("Notification:", notification)

    print("---")
    event = request.forms.get("event")
    print("Event:", event)
    print("---")
    
    # I only want to monitor the activities a8,a7,a6
    if "content" in notification and "activity" in notification["content"]:
        if notification["content"]["activity"] in ["a8","a7","a6"]:
            if "received" in notification["content"]:
                if "data" in notification["content"]["received"][0]:
                    value = yaml.safe_load(notification["content"]["received"][0]["data"])["value"]
                    monitor_event = {'Id': notification["content"]["activity"], 'Name': notification["content"]["label"], 'Value': value, 'Time':notification["timestamp"]}
                    print("MONITOR EVENT:")
                    print(monitor_event)
                    print("---")


@app.route('/test', method='POST')
def test():
    global monitor_event

    payload = request.json
    print("---------------------")
    print("Data:", payload) 
    monitor_event = payload
    print("---------------------")

if __name__ == '__main__':
    #run(app, host='::', port=24209)
    run(app, host='localhost', port=8080, server='gevent')
