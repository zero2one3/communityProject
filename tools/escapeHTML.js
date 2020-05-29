function escapeHTML(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quto;')
            .replace(/'/g, '&#x27;')
            .replace(/`/g, '&#96;')
            .replace(/\//g, '&#x2F;')
}

module.exports = escapeHTML