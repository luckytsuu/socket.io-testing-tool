import { elements } from "./dom.js";

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
        li.textContent = channel

        li.addEventListener("click", () => {
            manager.removeChannel(index)
            updateChannelsDisplay(manager)
        })

        elements["#listening-channels-list"].appendChild(li)
    });
}
