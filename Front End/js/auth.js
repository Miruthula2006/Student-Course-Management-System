const noticeText = "Authentication, registration, and password recovery are unavailable in this archived prototype. Use the active React application for backend authentication.";

function createNotice() {
    const notice = document.createElement("p");
    notice.className = "error-message prototype-auth-notice";
    notice.setAttribute("role", "status");
    notice.append(document.createTextNode(`${noticeText} `));

    const activeAppLink = document.createElement("a");
    activeAppLink.href = "../react-frontend/";
    activeAppLink.textContent = "Open the active React application.";
    notice.append(activeAppLink);
    return notice;
}

function disableArchivedAuthentication() {
    const forms = document.querySelectorAll(
        "#studentLoginForm, #adminLoginForm, #registerForm, #forgotPasswordForm"
    );

    forms.forEach((form) => {
        form.prepend(createNotice());
        form.addEventListener("submit", (event) => event.preventDefault());
    });

    if (forms.length === 0) {
        const actions = document.querySelector(".buttons");
        if (actions) actions.after(createNotice());
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableArchivedAuthentication, { once: true });
} else {
    disableArchivedAuthentication();
}
