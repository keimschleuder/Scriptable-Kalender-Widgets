// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calendar-alt;
const TEST_MODE = true

const CALENDAR_URL = ""

const VISIBLE_CALENDARS = ["Privat", "Schule", "Freizeit", "Kirche", "Orchester", "Family", "Spezial"]
const NUM_ITEMS_TO_SHOW = 3 // 3 is the max without it being cramped
const NO_ITEMS_MESSAGE = "Enjoy it." 

const BACKGROUND_COLOR = Color.black()
const DATE_COLOR = Color.red()
const ITEM_NAME_COLOR = Color.white()
const ITEM_TIME_COLOR = new Color("#eeeeee")

const CALENDAR_COLORS = {
    "Privat": Color.blue(),
    "Freizeit": Color.blue(),
    "Kirche": new Color("#e67c73"), // flamingo
    "Orchester": Color.yellow(),
    "Schule": Color.red(),
    "Family": Color.purple(),
    "Spezial": Color.orange(),
    "Deutsche Feiertage": Color.green(),
    "Geburtstage": Color.cyan()
}

const DATE_SIZE = 16
const ITEM_NAME_SIZE = 14
const ITEM_TIME_SIZE = 12

const DATE_FORMATTER = new DateFormatter()
const NOW = new Date()

if (!config.runsInWidget && !TEST_MODE) {
    const appleDate = new Date('2001/01/01')
    const timestamp = (NOW.getTime() - appleDate.getTime()) / 1000
    const callback = new CallbackURL(CALENDAR_URL + timestamp)
    callback.open()
    Script.complete()
} 
else { 
    let itemsToShow = []

    const events = await CalendarEvent.today([])
    for (const event of events) {
        if (event.endDate.getTime() > NOW.getTime() && event.calendar.title != "Ferien") {
            let includesTime = false
            if (!event.isAllDay) {
                includesTime = true
            }
            itemsToShow.push({
                id: event.identifier,
                name: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                dateIncludesTime: includesTime,
                calendarTitle: event.calendar.title
            })
        }
    }

    itemsToShow = itemsToShow.sort(sortItems).slice(0, NUM_ITEMS_TO_SHOW)

    // Lay out the widget!
    let widget = new ListWidget()
    widget.backgroundColor = BACKGROUND_COLOR

    // Add the top date
    DATE_FORMATTER.dateFormat = "EEEE d"
    let topDate = widget.addText(DATE_FORMATTER.string(NOW))
    topDate.textColor = DATE_COLOR
    topDate.font = Font.semiboldSystemFont(DATE_SIZE)

    
    // Put all of the event items on the bottom
    widget.addSpacer()

    // If there is at least one item today
    if (itemsToShow.length > 0) {
        for (i = 0; i < itemsToShow.length; i++) {
            // Add space between events
            if (i != 0) {
                widget.addSpacer(10)
            }
            let itemName
            itemName = widget.addText(formatItemName(itemsToShow[i]))
            itemName.lineLimit = 1
            itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemName.textColor = ITEM_NAME_COLOR
            widget.addSpacer(5)
                
            let itemDate = widget.addText(formatItemDate(itemsToShow[i]))
            itemDate.font = Font.mediumSystemFont(ITEM_TIME_SIZE)
            itemDate.textColor = getItemColor(itemsToShow[i])
        }
    } else {        
        // No Events found
        let message = widget.addText(NO_ITEMS_MESSAGE)
        message.textColor = ITEM_NAME_COLOR
        message.font = Font.lightSystemFont(ITEM_NAME_SIZE)  
    }

    // Finalize widget settings
    widget.setPadding(12, 12, 12, 0)
    widget.spacing = -3

    Script.setWidget(widget)
    widget.presentSmall()
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
    if (item.dateIncludesTime === true) {
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
    else {
        return "▐  Ganztägig"
    }
}

function getItemColor(item) {
    return CALENDAR_COLORS[item.calendarTitle]
}

function formatItemName(item) {
    return item.name
}

function getItemUrl(item) {
    return CALENDAR_URL + item.id
}