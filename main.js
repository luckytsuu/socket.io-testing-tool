const connectionPortInput = document.querySelector("#connection-ip")
const connectedAddress = document.querySelector("#server-address-display")
const messagesList = document.querySelector("#messages-list")
const messagesWarn = document.querySelector("#messages-warn")
const connectionButton = document.querySelector("#connection-button")
const disconnectionButton = document.querySelector("#disconnection-button")
const messageTypeInput = document.querySelector("#message-type")
const messageValueInput = document.querySelector("#message-value")
const messageEventInput = document.querySelector("#message-event")
const sendMessageButton = document.querySelector("#send-message-button")
const clearHistoryButton = document.querySelector("#clear-history-button")
const newChannelInput = document.querySelector("#new-channel-input")
const newChannelButton = document.querySelector("#new-channel-button")
const avaliableChannelsList = document.querySelector("#avaliable-channels")

let socket = undefined

const messageChannels = ["message"]

newChannelButton.addEventListener("click", () => {
    const newChannel = newChannelInput.value

    if (isValidString(newChannel)) {
        newChannelInput.value = ""
        messageChannels.push(newChannel.trim())
        updateListeningChannelsDisplay()
    } else {
        createMessage(
            "channel creation error", 
            `Invalid channel name: "${newChannel}"`
        )
    }
})

connectionButton.addEventListener("click", () => {
    const address = connectionPortInput.value

    if (isValidString(address)) {
        connectTo(address)
    } else {
        registerError("Forneça uma porta válida")
    }
})

clearHistoryButton.addEventListener("click", () => {
    messagesList.querySelectorAll("li").forEach(item => item.remove())
    const newListItem = document.createElement("li")
    newListItem.appendChild(messagesWarn)
    messagesList.appendChild(newListItem)
})

sendMessageButton.addEventListener("click", () => {
    let messageType = messageTypeInput.value
    let messageEvent = messageEventInput.value

    if (!isConnected(socket)) {
        createMessage("message error", "Socket need to be connected before trying to send message.")
    }

    if (isValidString(messageType)) {
        messageType = messageType.toLowerCase().trim()
        messageEvent = messageEvent.trim()
        let message = messageValueInput.value

        if (!isValidString(message)) {
            createMessage("message value error", "Null message value.")
        }

        if (!isValidString(messageEvent)) {
            messageEvent = "message"
        }

        switch (messageType) {
            case "json":
                message = JSON.parse(message)
            case "string":
                break
            case _:
                createMessage(
                    "message type error", 
                    `Invalid message type: ${messageType}`
                )
                return
        }

        messageValueInput.value = ""
        socket.emit(messageEvent, message)
        createMessage(`sended message ${messageEvent}`, message)
    } else {
        createMessage("message type error", "Null message type.")
    }
})

function connectTo(address) {
    if (isConnected(socket)) {
        createMessage("error", "Impossible to connect, finish the actual connection before.")
        return
    }

    socket = new io(address)
    loadEvents(address)
}

function loadEvents(address) {
    socket.on('connect', () => {
        createMessage("connect", `Connection successfully estabilished with \"${address}\"`)
        connectedAddress.textContent = address
        connectionButton.style.display = "none"
        disconnectionButton.style.display = "block"
    })

    socket.on('disconnect', () => {
        createMessage("disconnect", `Disconnected from \"${address}\"`)
        connectionButton.style.display = "block"
        disconnectionButton.style.display = "none"
    })

    socket.on('connect_error', err => {
        createMessage("connection error", `${err}`)
        disconnectSocket()
    })

    updateListeningChannelsDisplay()
}

function createMessage(type, msg) {
    if (messagesWarn) messagesWarn.remove()
    
    const parent = document.createElement("li")
    parent.classList.add(["message-log"])

    const isSendedMessage = type.startsWith("sended message")
    let typeText = type

    if (isSendedMessage) {
        parent.style.marginLeft = "auto"
        typeText = `\"${type.split(" ")[2]}\" message`
    }

    const infoDisplay = document.createElement("div")
    infoDisplay.classList.add(["message-log-info"])

    const creationDateDisplay = document.createElement("p")
    creationDateDisplay.textContent = new Date().toDateString()

    const typeDisplay = document.createElement("h1")
    typeDisplay.textContent = typeText

    const divider = document.createElement("div")
    divider.classList.add(["divider"])

    const msgDisplay = document.createElement("p")
    msgDisplay.textContent = msg

    appendChilds(infoDisplay, [typeDisplay, creationDateDisplay])
    appendChilds(parent, [infoDisplay, divider, msgDisplay])

    messagesList.appendChild(parent)
}

function disconnectSocket() {
    if (!isConnected(socket)) {
        createMessage("error", "Impossible to disconnect, start a connection before trying to connect.")
    }

    connectedAddress.textContent = "undefined";
    socket.disconnect();
}

function updateListeningChannelsDisplay() {
    avaliableChannelsList.querySelectorAll("li").forEach(child => child.remove())

    messageChannels.forEach(channel => {
        const removeButton = document.createElement("button")
        removeButton.textContent = channel

        removeButton.addEventListener("click", () => {
            if (messageChannels.length === 1) {
                createMessage(
                    "channel exclusion error",
                    "Client needs to be listening to at least one channel."
                )
                return
            }

            if (isConnected(socket)) socket.off(channel)
            const i = messageChannels.indexOf(channel)
            if (i !== -1) messageChannels.splice(i, 1)

            updateListeningChannelsDisplay()
        })

        const listItem = document.createElement("li")
        listItem.appendChild(removeButton)
        avaliableChannelsList.appendChild(listItem)

        if (isConnected(socket)) {
            socket.off(channel)
            socket.on(channel, data => {
                createMessage(`"${channel}" message`, data)
            })
        }
    })
}

updateListeningChannelsDisplay()