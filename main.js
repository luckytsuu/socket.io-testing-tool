import { clearMessages, createMessage, updateChannelsDisplay, updateConnectionInfoVisibilty } from "./display.js";
import { elements } from "./dom.js";
import ConnectionManager from "./ws.js";

const manager = new ConnectionManager()
export const generalConfigs = {}

manager.setMessageCallback((msg, channel) => createMessage(channel, msg))

manager.setConnectionCallback((address) => {
    createMessage("Client", `Connection successfully established with ${address}`)
    elements["#connection-address-field"].value = null
    elements["#connect-button"].textContent = "Disconnect"
    elements["#channels-options"].style.display = "block"
    updateConnectionInfoVisibilty(manager)
    updateChannelsDisplay(manager)
})

manager.setDisconnectCallback(() => {
    createMessage("Client", "The client has been disconnected")
    elements["#connect-button"].textContent = "Connect"
    elements["#channels-options"].style.display = "none"
    updateConnectionInfoVisibilty(manager)
    updateChannelsDisplay(manager)
})

manager.setErrorCallback(e => {
    createMessage("Client (ERROR)", `An error occurred: ${e}`)
    manager.disconnect()
})

elements["#connect-button"].addEventListener("click", () => {
    manager.isConnected() 
        ? manager.disconnect() 
        : manager.connect(elements["#connection-address-field"].value)
})

elements["#add-channel-button"].addEventListener("click", () => {
    const channelName = elements["#new-channel-field"].value
    manager.addChannel(channelName)
    updateChannelsDisplay(manager)
    elements["#new-channel-field"].value = null
})

elements["#emit-message-button"].addEventListener("click", () => {
    const content = elements["#message-content-field"].value
    const channel = elements["#message-channel-field"].value
    manager.emit(channel, content)

    elements["#message-content-field"].value = null
    elements["#message-channel-field"].value = null
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
        }
    })
