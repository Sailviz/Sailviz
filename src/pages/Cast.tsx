import React, { useEffect } from 'react';
import Script from 'next/script';

const Cast = () => {
    /**
 * Main JavaScript for handling Chromecast interactions.
 */

    const initializeCastApi = () => {
        chrome.cast.receiver.logger.setLevelValue(0);
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        console.log('Starting Receiver Manager');

        window.castReceiverManager.onReady = function (event) {
            console.log('Received Ready event: ' + JSON.stringify(event.data));
            window.castReceiverManager.setApplicationState('chromecast-dashboard is ready...');
        };

        window.castReceiverManager.onSenderConnected = function (event) {
            console.log('Received Sender Connected event: ' + event.senderId);
        };

        window.castReceiverManager.onSenderDisconnected = function (event) {
            console.log('Received Sender Disconnected event: ' + event.senderId);
        };

        window.messageBus =
            window.castReceiverManager.getCastMessageBus(
                'urn:x-cast:com.boombatower.chromecast-dashboard', cast.receiver.CastMessageBus.MessageType.JSON);

        window.messageBus.onMessage = function (event) {
            console.log('Message [' + event.senderId + ']: ' + event.data);

            if (event.data['type'] == 'load') {
                console.log("load")
            }
        }

        // Initialize the CastReceiverManager with an application status message.
        window.castReceiverManager.start({ statusText: 'Application is starting' });
        console.log('Receiver Manager started');

    }
    useEffect(() => {
        if (!chrome.cast || !chrome.cast.isAvailable) {
            setTimeout(initializeCastApi, 1000);
        }
    }, [])
    return (
        <div>
            <Script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js" />

            <div> Welcome!</div>
        </div>
    );
};

export default Cast;