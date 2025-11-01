const appendChilds = (parent, childs) => {
    for (const child of childs) parent.appendChild(child)
}

const isValidString = (string) => string && string.trim() !== ""

const isConnected = (socket) => socket && socket.connected