import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

export default class ConnectionManager {
    isConnected() { return this.io && this.io.connected }

    async connect(addr, additionalSocketSettings = {}) {
        if (this.isConnected()) this.disconnect()

        this.addr = addr // connection address, such as http://localhost:3000/
        this.io = await io(addr, additionalSocketSettings)
        this.listeningChannels = []

        return new Promise(resolve => {
            this.io.on("connect", () => {
                this.addChannel("messages")
                resolve()
            })

            this.io.on("disconnect", () => {
                if (this.onDisconnect) this.onDisconnect()
                resolve()
            })

            this.io.on("error", err => {
                if (this.onError) this.onError(err)
                resolve()
            })
        })
    }

    disconnect() {
        if (this.isConnected()) this.io.disconnect()

        this.removeChannels(this.listeningChannels)
        this.addr = undefined
        this.io = undefined
    }

    addChannels(channels) {
        channels.forEach(channel => this.addChannel(channel))
    }

    removeChannels(channelsIndex) {
        channelsIndex.forEach(idx => this.removeChannel(idx))
    }

    addChannel(channel) {
        if (!this.isConnected() || this.listeningChannels.includes(channel)) return
        this.listeningChannels.push(channel)
        if (!this.onMessage) return

        this.io.on(channel, msg => this.onMessage(msg, channel))
    }

    removeChannel(index) {
        const channel = this.listeningChannels[index]
        if (
            !this.isConnected() 
            || !this.listeningChannels.includes(channel)
            || this.listeningChannels.length === 1
        ) return

        this.listeningChannels.splice(index, 1)
        this.io.off(channel)
    }

    setMessageCallback(callback) { this.onMessage = callback }

    setDisconnectCallback(callback) { this.onDisconnect = callback }

    setErrorCallback(callback) { this.onError = callback }

    emit(channel, message) {
        if (this.isConnected()) this.io.emit(channel, message)
    }
}

/* expected workflow

const manager = new ConnectionManager()

manager.setMessageCallback((msg, channel) => {
    console.log(`${channel}: ${msg}`)
})

manager.setDisconnectCallback(() => {
    console.log("O Cliente foi desconectado!")
})

manager.connect("http://localhost:3030")
    .then(() => {
        manager.addChannel("createdRooms")
        manager.emit("createRoom", "lucas")
        manager.disconnect()
    })

*/
