import React, { useEffect } from 'react'
import Script from 'next/script';


var applicationID = '0AA4CA7E'; //mine
var namespace = 'urn:x-cast:com.sailviz';


const Dashboard = () => {
    const [url, setUrl] = React.useState('')
    var session: any = null

    const connect = () => {
        console.log('connect()');
        sendMessage({
            type: 'load',
            url: "https://www.example.com",
            refresh: 0,
        });
    }

    function sessionListener(e: any) {
        console.log('New session ID: ' + e.sessionId);
        session = e;
        e.addUpdateListener(sessionUpdateListener);
    }

    function sessionUpdateListener(isAlive: any) {
        console.log((isAlive ? 'Session Updated' : 'Session Removed') + ': ' + session.sessionId);
        if (!isAlive) {
            session = null;
        }
    };

    const sendMessage = (message: object) => {
        if (session != null) {
            session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
        }
        else {
            chrome.cast.requestSession((e: any) => {
                session = e;
                sessionListener(e);
                session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
            }, onError);
        }
    }

    function onInitSuccess(e: any) {
        console.log('onInitSuccess');
    }

    function onError(message: any) {
        console.log('onError: ' + JSON.stringify(message));
    }

    function onStopAppSuccess() {
        console.log('onStopAppSuccess');
    }


    function receiverListener(e) {
        // Due to API changes just ignore this.
    }

    function stopApp() {
        session.stop(onStopAppSuccess, onError);
    }

    function initializeCastApi() {
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
            sessionListener,
            receiverListener);

        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
    };

    function onSuccess(message: any) {
        console.log('onSuccess: ' + JSON.stringify(message));
    }

    useEffect(() => {
        if (!chrome.cast || !chrome.cast.isAvailable) {
            setTimeout(initializeCastApi, 1000);
        }
    }, [])

    return (
        <div>
            <Script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></Script>
            <p>
                Enter a Url for to display on dashboard and if the page does not update
                itself then enter an appropriate refresh interval in seconds.
            </p>
            <label>Url <input type="text" id="url" placeholder="http://www.gabenewell.org/" /></label>
            <div onClick={connect}>Launch</div>
            <label>Refresh <input type="number" id="refresh" min="0" value="0" /></label>
            <button id="kill" className='disabled'>Stop casting</button>
            <p id="post-note" className="hidden">
                If the page does not load please be sure HTTP header X-Frame-Options
                allows the page to be loaded inside a frame not on the same origin.
            </p>
        </div>
    )
}

export default Dashboard