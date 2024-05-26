import React, { useEffect, useState } from 'react'
import Script from 'next/script';
import Cookies from 'js-cookie';

const applicationID = '0AA4CA7E';
const namespace = 'urn:x-cast:com.sailviz';


const Dashboard = () => {
    const [url, setUrl] = React.useState('')
    var session: any = null

    const connect = () => {
        console.log('connect()');
        sendMessage({
            type: 'clubId',
            clubId: clubId,
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
                session.addMessageListener(namespace, console.log)
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


    function receiverListener(e: any) {
        // Due to API changes just ignore this.
    }

    function stopApp() {
        console.log(session)
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

    var [clubId, setClubId] = useState<string>("invalid")

    const showPage = () => {
        sendMessage({
            type: 'showPage',
            page: 'id'
        });
    }

    useEffect(() => {
        setClubId(Cookies.get('clubId') || "")
    }, [])

    return (
        <div>
            <Script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></Script>
            <p>
                Enter a Url for to display on dashboard and if the page does not update
                itself then enter an appropriate refresh interval in seconds.
            </p>

            <input type="text" id="url" onChange={() => { }} />
            <div onClick={connect}>Launch</div>
            Refresh <input type="number" id="refresh" min="0" value="0" />
            <button id="kill" className='disabled' onClick={stopApp}>Stop casting</button>
            <p id="post-note" className="hidden">
                If the page does not load please be sure HTTP header X-Frame-Options
                allows the page to be loaded inside a frame not on the same origin.
            </p>
            <p onClick={showPage} className="w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                Results
            </p>
        </div>
    )
}

export default Dashboard