import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { createMessage } from "./display.js";

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
                if (this.onConnect) this.onConnect(addr)
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

            this.io.on("connect_error", err => {
                createMessage("Client (ERROR)", `An error occurred while the client was trying to connect: ${err.message}`)
                resolve()
            })

            this.io.on("reconnect", (attempt) => {
                createMessage("Client (RECONNECTED)", `The client successfully reconnected after ${attempt} attempts`)
                resolve()
            })

            this.io.on("reconnecting", (attempt) => {
                createMessage(`Client (RECONNECTING_${attempt})`, `Trying to establish a connection with ${this.addr}`)
                resolve()
            })

            socket.on("reconnect_failed", () => {
                createMessage("Client (ERROR)", "Reconnection aborted: Too many tries")
            })

            socket.on("reconnect_error", (err) => {
                createMessage("Client (ERROR)", `An error occured while the reconnection was being executed: ${err}`)
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
        if (!this.isConnected() || this.listeningChannels.includes(channel)) {
            createMessage("Client (ERROR)", `Channel "${channel}" couldn't be added because it is already being listen`)
            return
        }
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
        ) {
            createMessage("Client (ERROR)", "You have to be listening at least one channel")
            return
        }

        this.listeningChannels.splice(index, 1)
        this.io.off(channel)
    }

    setMessageCallback(callback) { this.onMessage = callback }

    setDisconnectCallback(callback) { this.onDisconnect = callback }

    setConnectionCallback(callback) { this.onConnect = callback }

    setErrorCallback(callback) { this.onError = callback }

    emit(channel, message) {
        if (this.isConnected()) this.io.emit(channel, message)
    }
}
