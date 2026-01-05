import { updateChannelsDisplay, updateConnectionInfoVisibilty } from "./display.js";
import { elements } from "./dom.js";
import ConnectionManager from "./ws.js";

const manager = new ConnectionManager()

manager.setMessageCallback((msg, channel) => {
    console.log(`${channel}: ${msg}`)
})

manager.setDisconnectCallback(() => {
    console.log("O Cliente foi desconectado!")
    elements["#connect-button"].textContent = "Connect"
    elements["#channels-options"].style.display = "none"
    updateConnectionInfoVisibilty(manager)
})

manager.setErrorCallback(e => {
    console.log(`Um erro aconteceu: ${e}`)
    manager.disconnect()
})

elements["#connect-button"].addEventListener("click", () => {
    if (!manager.isConnected()) {
        const addr = elements["#connection-address-field"].value
    
        manager.connect(addr)
            .catch(e => console.log(`Um erro aconteceu: ${e}`))
            .then(() => {
                elements["#connection-address-field"].value = null
                elements["#connect-button"].textContent = "Disconnect"
                elements["#channels-options"].style.display = "block"
                updateConnectionInfoVisibilty(manager)
                updateChannelsDisplay(manager)
            })
        return
    }
    manager.disconnect()
    updateConnectionInfoVisibilty(manager)
    updateChannelsDisplay(manager)
})

elements["#add-channel-button"].addEventListener("click", () => {
    const channelName = elements["#new-channel-field"].value
    manager.addChannel(channelName)
    updateChannelsDisplay(manager)
    elements["#new-channel-field"].value = null
})