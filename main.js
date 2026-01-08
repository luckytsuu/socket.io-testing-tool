import { clearMessages, createMessage, updateChannelsDisplay, updateConnectionInfoVisibilty } from "./display.js";
import { elements } from "./dom.js";
import ConnectionManager from "./ws.js";

const manager = new ConnectionManager()

manager.setActionCallbacks({
    "message": (msg, channel) => createMessage(channel, msg),
    "connect": address => {
        createMessage("Client", `Connection successfully established with ${address}`)
        elements["#connection-address-field"].value = null
        elements["#connect-button"].textContent = "Disconnect"
        elements["#channels-options"].style.display = "block"
        updateConnectionInfoVisibilty(manager)
        updateChannelsDisplay(manager)
    },
    "disconnect": () => {
        createMessage("Client", "The client has been disconnected")
        elements["#connect-button"].textContent = "Connect"
        elements["#channels-options"].style.display = "none"
        updateConnectionInfoVisibilty(manager)
        updateChannelsDisplay(manager)
    },
    "error": e => {
        createMessage("Client (ERROR)", `An error occurred: ${e}`)
        manager.disconnect()
    }
})

export const generalConfigs = {}

elements["#connect-button"].addEventListener("click", () => {
    manager.isConnected() 
        ? manager.disconnect() 
        : manager.connect(elements["#connection-address-field"].value)
})

elements["#add-channel-button"].addEventListener("click", () => {
    const channelName = elements["#new-channel-field"].value
    manager.addChannel(channelName, () => {
        createMessage("Client (ERROR)", `Channel "${channel}" couldn't be added because it is already being listen`)
    })
    updateChannelsDisplay(manager)
    elements["#new-channel-field"].value = null
})

elements["#emit-message-button"].addEventListener("click", () => {
    const content = elements["#message-content-field"].value
    const channel = elements["#message-channel-field"].value
    let convertedContent = content

    try {
        if (generalConfigs["useJSON"]) convertedContent = JSON.parse(content)
        
        manager.emit(channel, convertedContent, () => {
            createMessage("Client (ERROR)", "Connect to a server before try to emit a message")
        })
        
        elements["#message-content-field"].value = null
        elements["#message-channel-field"].value = null
        createMessage(channel, content, true) // always save the stringfied version
    } catch (_)  {
        createMessage("Client (ERROR)", `Couldn't parse "${content}" to JSON`)
    }
})

elements["#clear-messages-button"].addEventListener("click", clearMessages)

document.querySelectorAll(".options-switcher").forEach(switcher => {
    switcher.addEventListener("click", () => {
        const isActivated = switcher.dataset.activated === "true"
        switcher.dataset.activated = String(!isActivated) // invert value
        generalConfigs[switcher.dataset.name] = !isActivated // update it in general configs
    })
})

// initial value assignement
document.querySelector("#general-options-list")
    .querySelectorAll("li").forEach(option => {
        switch (option.className) {
            case "options-switcher":
                const isActivated = option.dataset.activated === "true"
                generalConfigs[option.dataset.name] = isActivated
                break
            // FEAT: add reconnect amount and timeout input config
        }
    })
