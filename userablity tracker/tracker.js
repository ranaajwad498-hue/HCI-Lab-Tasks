(function() {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const trackingEndpoint = 'http://localhost:8000/api/track';

    // Helper to send telemetry data
    function sendData(eventType, eventData) {
        const payload = {
            session_id: sessionId,
            event_type: eventType,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            data: eventData
        };

        if (navigator.sendBeacon) {
            navigator.sendBeacon(trackingEndpoint, JSON.stringify(payload));
        } else {
            fetch(trackingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(console.error);
        }
    }

    // 1. TRACK PAGE LOAD
    window.addEventListener('load', () => {
        sendData('page_view', {
            referrer: document.referrer,
            viewport: { width: window.innerWidth, height: window.innerHeight }
        });
    });

    // 2. TRACK CLICKS
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Skip inputs and textareas to protect private typed data
        if (['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) {
            return;
        }

        sendData('click', {
            tag: target.tagName,
            id: target.id || null,
            text: target.innerText ? target.innerText.substring(0, 50).trim() : null,
            position: { x: e.clientX, y: e.clientY } // Click coordinates on screen
        });
    });

    // 3. TRACK MOUSE MOVEMENT (Throttled to max 5 updates per second)
    let lastMouseMoveTime = 0;
    const MOUSE_THROTTLE_MS = 200; // Log position every 200ms

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMouseMoveTime >= MOUSE_THROTTLE_MS) {
            lastMouseMoveTime = now;
            
            sendData('mousemove', {
                x: e.clientX,
                y: e.clientY,
                page_x: e.pageX,
                page_y: e.pageY
            });
        }
    });

    // 4. TRACK SCROLLING (Throttled)
    let lastScrollTime = 0;
    const SCROLL_THROTTLE_MS = 500; // Log scroll position every 500ms

    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollTime >= SCROLL_THROTTLE_MS) {
            lastScrollTime = now;

            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = totalHeight > 0 ? Math.round((window.scrollY / totalHeight) * 100) : 0;

            sendData('scroll', {
                scroll_y: window.scrollY,
                scroll_percentage: scrollPercent
            });
        }
    });

    // 5. TRACK TAB VISIBILITY (User switches tabs or minimizes window)
    document.addEventListener('visibilitychange', () => {
        sendData('visibility_change', {
            state: document.visibilityState // 'visible' or 'hidden'
        });
    });

})();