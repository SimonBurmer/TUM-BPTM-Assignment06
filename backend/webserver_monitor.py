#! /usr/bin/python3
import os
os.environ["GEVENT_SUPPORT"] = "True"

from gevent import monkey
monkey.patch_all()

from bottle import Bottle, request, run, static_file, response
import yaml
import json
import time

app = Bottle()

monitor_event =  {"Info": "This is a ping message from the server"}
event_storage = []

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
    send_data = {"Info": "This is a ping message from the server"}

    #push all data from storage to new connection 
    for event in event_storage:
        yield f"data: {json.dumps(event)}\n\n"
        print("Sending Storage Element:", event)
        time.sleep(0.2)  

    #sse loop
    while True:
        print("Sending data:", monitor_event)

        if monitor_event != send_data:
            yield f"data: {json.dumps(monitor_event)}\n\n"
            monitor_event = send_data
        else:
            yield f"data: {json.dumps(send_data)}\n\n"

        time.sleep(2)  


# Gets called from CPEE
@app.route('/log', method='POST')
def log():
    global monitor_event
    global event_storage

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
        if notification["content"]["activity"] in ["a8","a7","a6", "a15"]:
            if "received" in notification["content"]:
                if "data" in notification["content"]["received"][0]:
                    value = yaml.safe_load(notification["content"]["received"][0]["data"])["value"]
                    monitor_event = {'Id': notification["content"]["activity"], 'Name': notification["content"]["label"], 'Value': int(value), 'Time':notification["timestamp"]}
                    event_storage.append(monitor_event)
                    print("MONITOR EVENT:")
                    print(monitor_event)
                    print("---")


@app.route('/test', method='POST')
def test():
    global monitor_event
    global event_storage

    payload = request.json
    print("---------------------")
    print("Data:", payload) 
    monitor_event = payload
    event_storage.append(monitor_event)
    print("---------------------")

if __name__ == '__main__':
    run(app, host='::', port=24209, server='gevent')
    #run(app, host='localhost', port=8080, server='gevent')

    #PUBLIC_URL=https://lehre.bpm.in.tum.de/ports/24209 npm run build
