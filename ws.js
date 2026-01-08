import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

export default class ConnectionManager {
    isConnected() { return this.io && this.io.connected }

    setActionCallbacks(actionCallbacks) { this.actionCallbacks = actionCallbacks }
    // should follow the formula: {actionName: () => console.log("action")}
    // e.g.: {connect: (addr) => console.log(`connected to: ${addr}`)}

    async connect(addr, additionalSocketSettings = {}) {
        if (this.isConnected()) this.disconnect()

        this.addr = addr // connection address, such as http://localhost:3000/
        this.io = await io(addr, additionalSocketSettings)
        this.listeningChannels = []

        return new Promise(resolve => {
            for (const [action, callback] of Object.entries(this.actionCallbacks)) {
                switch (action) {
                    // special cases
                    case "message":
                        this.onMessage = callback
                        break
                    case "connect":
                        this.io.on("connect", () => {
                            this.addChannel("messages")
                            callback(addr)
                        })
                        break
                    // error cases & reconnection attempt
                    case "reconnect_error":
                    case "connect_error":
                    case "reconnecting":
                    case "reconnect":
                    case "error":
                        this.io.on(action, arg => {
                            callback(arg)
                            resolve()
                        })
                        break
                    default:
                        this.io.on(action, () => {
                            callback()
                            resolve()
                        })
                }
            }
        })
    }

    disconnect() {
        if (this.isConnected()) this.io.disconnect()

        this.listeningChannels = []
        this.addr = undefined
        this.io = undefined
    }

    addChannels(channels) {
        channels.forEach(channel => this.addChannel(channel))
    }

    removeChannels(channelsIndex) {
        channelsIndex.forEach(idx => this.removeChannel(idx))
    }

    addChannel(channel, onError) {
        if (!this.isConnected() || this.listeningChannels.includes(channel)) {
            onError()
            return
        }
        this.listeningChannels.push(channel)
        if (!this.onMessage) return

        this.io.on(channel, msg => this.onMessage(msg, channel))
    }

    removeChannel(index, onError) {
        const channel = this.listeningChannels[index]
        if (
            !this.isConnected() 
            || !this.listeningChannels.includes(channel)
            || this.listeningChannels.length === 1
        ) {
            onError()
            return
        }

        this.listeningChannels.splice(index, 1)
        this.io.off(channel)
    }

    emit(channel, message, onError) {
        this.isConnected() 
            ? this.io.emit(channel, message)
            : onError()
    }
}
