const connectionPortInput = document.querySelector("#connection-ip")
const connectedAddress = document.querySelector("#server-address-display")
const messagesList = document.querySelector("#messages-list")
const messagesWarn = document.querySelector("#messages-warn")
const connectionButton = document.querySelector("#connection-button")
const disconnectionButton = document.querySelector("#disconnection-button")
const messageTypeInput = document.querySelector("#message-type")
const messageValueInput = document.querySelector("#message-value")
const sendMessageButton = document.querySelector("#send-message-button")

let socket = undefined

connectionButton.addEventListener("click", () => {
    const address = connectionPortInput.value

    if (isValidString(address)) {
        connectTo(address)
    } else {
        registerError("Forneça uma porta válida")
    }
})

sendMessageButton.addEventListener("click", () => {
    let messageType = messageTypeInput.value

    if (!isConnected(socket)) {
        createMessage("message error", "Socket need to be connected before trying to send message.")
    }

    if (isValidString(messageType)) {
        messageType = messageType.toLowerCase()
        let message = messageValueInput.value

        if (!isValidString(message)) {
            createMessage("message value error", "Null message value.")
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

        socket.emit("message", message)
        createMessage("sended message", message)
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

    socket.on('message', data => {
        createMessage("message", data)
    })

    socket.on('connect_error', err => {
        createMessage("connection error", `${err}`)
        disconnectSocket()
    })
}

function createMessage(type, msg) {
    if (messagesWarn) messagesWarn.remove()

    const parent = document.createElement("li")
    parent.classList.add(["message-log"])

    const infoDisplay = document.createElement("div")
    infoDisplay.classList.add(["message-log-info"])

    const creationDateDisplay = document.createElement("p")
    creationDateDisplay.textContent = new Date().toDateString()

    const typeDisplay = document.createElement("h1")
    typeDisplay.textContent = type

    const divider = document.createElement("div")
    divider.classList.add(["divider"])

    const msgDisplay = document.createElement("p")
    msgDisplay.textContent = msg

    appendChilds(infoDisplay, [typeDisplay, creationDateDisplay])
    appendChilds(parent, [infoDisplay, divider, msgDisplay])

    switch (type) {
        case "sended message":
            parent.style.marginLeft = "auto"
            break
    }

    messagesList.appendChild(parent)
}

function disconnectSocket() {
    if (!isConnected(socket)) {
        createMessage("error", "Impossible to disconnect, start a connection before trying to connect.")
    }

    connectedAddress.textContent = "undefined";
    socket.disconnect();
}