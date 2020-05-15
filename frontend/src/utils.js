export function translateColor(color) {
    let res
    switch (color) {
        case "red":
            res = "red"
            break
        case "orange":
            res = "orange"
            break
        case "yellow":
            res = "yellow"
            break
        case "green":
            res = "green"
            break
        case "blue":
            res = "darkturquoise"
            break
        case "purple":
            res = "purple"
            break
        case "pink":
            res = "pink"
            break
        case "black":
            res = "rgb(15, 15, 15)"
            break
        case "white":
            res = "rgb(235, 235, 235)"
            break
        default:
    }
    return res
}

export function formatSeconds(sec) {
    let resSeconds = `${sec % 60}`
    if (sec % 60 < 10) resSeconds = "0" + resSeconds
    return `${ Math.floor(sec / 60) }:` + resSeconds
}