// used to adquire DOM objects fast and easily

function getUnique(tagsArray) {
    const elements = {}
    tagsArray.forEach(tag => elements[tag] = document.querySelector(tag))

    return elements
}

export const elements = getUnique([
    "#connection-id", "#connection-address", "#connection-info", "#no-messages-warn", 
    "#connect-button", "#connection-address-field", "#listening-channels-list",
    "#new-channel-field", "#add-channel-button", "#channels-options"
])