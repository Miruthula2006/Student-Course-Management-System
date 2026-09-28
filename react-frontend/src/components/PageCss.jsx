import { useEffect } from "react";

const PageCss = ({ href }) => {
    useEffect(() => {
        const existingLink = document.querySelector(
            `link[data-page-css="${href}"]`
        );

        if (existingLink) {
            return;
        }

        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute("data-page-css", href);

        document.head.appendChild(link);

        return () => {
            const addedLink = document.querySelector(
                `link[data-page-css="${href}"]`
            );

            if (addedLink) {
                addedLink.remove();
            }
        };
    }, [href]);

    return null;
};

export default PageCss;