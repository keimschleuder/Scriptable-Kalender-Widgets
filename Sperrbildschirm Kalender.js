// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calendar-alt;
const VKal = importModule("Variables_Kal")
const V = new VKal()

const TEST_MODE = V.TEST_MODE

const CALENDAR_URL = V.CALENDAR_URL

const VISIBLE_CALENDARS = V.VISIBLE_CALENDARS
const NUM_ITEMS_TO_SHOW = 1 // 1 is the max without it being cramped
const NO_ITEMS_MESSAGE = V.NO_ITEMS_MESSAGE

const ITEM_NAME_SIZE = V.ITEM_NAME_SIZE
const ITEM_TIME_SIZE = V.ITEM_TIME_SIZE

const DATE_FORMATTER = new DateFormatter()
const NOW = new Date()

if (!config.runsInWidget && !TEST_MODE) {
    const appleDate = new Date('2001/01/01')
    const timestamp = (NOW.getTime() - appleDate.getTime()) / 1000
    const callback = new CallbackURL(CALENDAR_URL + timestamp)
    callback.open()
    Script.complete()
} else { 
    let itemsToShow = []

    const events = await CalendarEvent.today([])
    for (const event of events) {
        if (event.endDate.getTime() > NOW.getTime() && event.calendar.title != "Ferien" && !event.isAllDay) {
            let includesTime = false
            itemsToShow.push({
                id: event.identifier,
                name: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                dateIncludesTime: includesTime,
            })
        }
    }

    itemsToShow = itemsToShow.sort(sortItems).slice(0, NUM_ITEMS_TO_SHOW)
    item = itemsToShow[0]

    // Lay out the widget!
    let widget = new ListWidget()

    // If there is at least one item today

    if (itemsToShow.length > 0) {
        let itemName = widget.addText(item.name)
        itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
        widget.addSpacer(5)
            
        let itemDate = widget.addText(formatItemDate(item))
        itemDate.font = Font.mediumSystemFont(ITEM_TIME_SIZE)
    } 
    // Finalize widget settings
    widget.setPadding(12, 12, 12, 0)
    widget.spacing = -3

    Script.setWidget(widget)
    widget.presentAccessoryRectangular()
    Script.complete()
}

// WIDGET TEXT HELPERS

function sortItems(first, second) {
    if (first.dateIncludesTime === false && second.dateIncludesTime === false) {
        return 0
    } else if (first.dateIncludesTime === false) {
        return -1
    } else if (second.dateIncludesTime === false) {
        return 1
    } else {
        return first.startDate - second.startDate
    }
}

function formatItemDate(item) {
    if (item.startDate <= NOW){
        DATE_FORMATTER.dateFormat = "hh:mma"
        let endDate = DATE_FORMATTER.string(item.endDate)
        return "▐  Bis " + endDate
    } else {
        DATE_FORMATTER.dateFormat = "hh:mm"
        let startDate = DATE_FORMATTER.string(item.startDate)
        DATE_FORMATTER.dateFormat = "hh:mma"
        let endDate = DATE_FORMATTER.string(item.endDate)
        return "▐  " + startDate + " — " + endDate
    } 
}

function getItemUrl(item) {
    return CALENDAR_URL + item.id  
}