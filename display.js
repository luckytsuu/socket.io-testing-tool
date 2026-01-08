import { elements } from "./dom.js?v=2";

export function updateConnectionInfoVisibilty(manager) {
    const isConnected = manager.isConnected()
    const addr = elements["#connection-address"]
    const id = elements["#connection-id"]
    const div = elements["#connection-info"]

    if (isConnected) {
        addr.textContent = manager.addr
        id.textContent = manager.io.id
        div.style.opacity = 1
        return
    }
    div.style.opacity = 0
}

function removeChannelsDisplay() {
    const ul = elements["#listening-channels-list"]
    while(ul.firstChild) ul.removeChild(ul.firstChild)
}

export function updateChannelsDisplay(manager) {
    removeChannelsDisplay()

    manager.listeningChannels.forEach((channel, index) => {
        const li = document.createElement("li")
        li.textContent = `@${channel}`

        li.addEventListener("click", () => {
            manager.removeChannel(index, () => {
                createMessage("Client (ERROR)", "You have to be listening at least one channel")
            })
            updateChannelsDisplay(manager)
        })

        elements["#listening-channels-list"].appendChild(li)
    });
}

export function createMessage(title, content, threatAsClient = false) {
    const warn = elements["#no-messages-warn"]
    if (getComputedStyle(warn).display === "block") warn.style.display = "none"

    const container = document.createElement("li")
    container.className = "message-container text-readonly"
    if (title.includes("Client") || threatAsClient) container.style.marginLeft = "auto"

    const header = document.createElement("h1")
    header.textContent = `@${title}`

    const paragraph = document.createElement("p")
    paragraph.textContent = content

    Array.from([header, document.createElement("hr"), paragraph]).forEach(el => {
        container.appendChild(el)
    });

    elements["#messages-list"].appendChild(container)
}

export function clearMessages() {
    elements["#messages-list"]
        .querySelectorAll("li")
        .forEach(li => li.remove())
    
    elements["#no-messages-warn"].style.display = "block"
}