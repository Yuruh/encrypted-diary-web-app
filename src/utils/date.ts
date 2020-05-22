export function dateToLocalDateTime(date: Date) {
    return date.toLocaleDateString() + " - " + date.toLocaleTimeString()
}