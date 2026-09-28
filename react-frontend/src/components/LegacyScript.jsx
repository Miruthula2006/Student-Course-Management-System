import { useEffect, useRef } from "react";

function LegacyScript({ src, module = false }) {
    const executed = useRef(false);

    useEffect(() => {
        if (executed.current) return;
        executed.current = true;

        const script = document.createElement("script");

        script.src = src;
        script.type = module ? "module" : "text/javascript";
        script.async = false;

        script.onload = function () {
            // Keep compatibility with the existing legacy modules.
            document.dispatchEvent(new Event("DOMContentLoaded"));
            window.dispatchEvent(new Event("load"));
            window.dispatchEvent(new Event("legacyScriptLoaded"));
        };

        script.onerror = function (error) {
            console.error("Unable to load legacy script:", src, error);
        };

        document.body.appendChild(script);
    }, [src, module]);

    return null;
}

export default LegacyScript;