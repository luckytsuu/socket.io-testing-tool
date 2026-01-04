// used to adquire DOM objects fast and easily

function getUnique(tagsArray) {
    const elements = {}
    tagsArray.forEach(tag => elements[tag] = document.querySelector(tag))

    return elements
}

export const elements = getUnique([
    "#test-button"
])