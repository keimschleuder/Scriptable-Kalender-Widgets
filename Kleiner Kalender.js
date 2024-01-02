// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calendar-alt;
const VKal = importModule("Variables_Kal")
const V = new VKal()

const TEST_MODE = V.TEST_MODE

const CALENDAR_URL = V.CALENDAR_URL

const VISIBLE_CALENDARS = V.VISIBLE_CALENDARS
const NUM_ITEMS_TO_SHOW = 3 // 3 is the max without it being cramped
const NO_ITEMS_MESSAGE = V.NO_ITEMS_MESSAGE

const DATE_COLOR = V.DATE_COLOR
const ITEM_NAME_COLOR = V.ITEM_NAME_COLOR
const ITEM_TIME_COLOR = V.ITEM_TIME_COLOR

const CALENDAR_COLORS = V.CALENDAR_COLORS

const DATE_SIZE = V.DATE_SIZE
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
        if (event.endDate.getTime() > NOW.getTime() && event.calendar.title != "Ferien") {
            let includesTime = false
            if (!event.isAllDay) {
                includesTime = true
            }
            let title = event.title
            if (event.calendar.title == "Geburtstage") {
                let index = title.lastIndexOf("(")
                let name = title.slice(0, index - 1)
                let age = title.slice(index + 1, -1)
                if (age == "Geburtstag") {
                    title = name + " hat Geburtstag"
                }
                else {
                    age = age.slice(0, age.indexOf("Geburtstag") - 2)
                    title = name + " wird " + age
                }
            }
            itemsToShow.push({
                id: event.identifier,
                name: title,
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

    // Add the top date
    DATE_FORMATTER.dateFormat = "EEEE d"
    let topDate = widget.addText(DATE_FORMATTER.string(NOW))
    topDate.textColor = DATE_COLOR
    topDate.font = Font.semiboldSystemFont(DATE_SIZE)

    const iCloud = FileManager.iCloud()
    let documents = iCloud.documentsDirectory()
    documents = documents + "/calendar/"
    const picture = documents + "Small.jpg"
    widget.backgroundImage = iCloud.readImage(picture)
    
    // Put all of the event items on the bottom
    widget.addSpacer()

    // If there is at least one item today
    if (itemsToShow.length > 0) {
        let gradient = new LinearGradient()
        gradient.colors = [new Color("#000000", 0.75), new Color("#000000", 0.15)]
        gradient.locations = [0, 1]
        widget.backgroundGradient = gradient
        
        for (i = 0; i < itemsToShow.length; i++) {
            // Add space between events
            if (i != 0) {
                widget.addSpacer(10)
            }
            
            let itemName = widget.addText(formatItemName(itemsToShow[i]))
            itemName.lineLimit = 1
            itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemName.textColor = ITEM_NAME_COLOR
            widget.addSpacer(5)
            
            let itemDate = widget.addText(formatItemDate(itemsToShow[i]))
            itemDate.font = Font.mediumSystemFont(ITEM_TIME_SIZE)
            itemDate.textColor = getItemColor(itemsToShow[i])
        }
    } else { // If there are no more items today
        // Add a more minimal overlay
        let gradient = new LinearGradient()
        gradient.colors = [new Color("#000000", 0.5), new Color("#000000", 0)]
        gradient.locations = [0, 0.5]
        widget.backgroundGradient = gradient
        
        // No events found:
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
    if (item.isReminder === true) {
        return REMINDER_COLORS[item.calendarTitle]
    } else {
        return CALENDAR_COLORS[item.calendarTitle]
    }
}

function formatItemName(item) {
    return item.name
}

function getItemUrl(item) {
    if (item.isReminder === false) {
        return CALENDAR_URL + item.id
    } else {
        return REMINDERS_URL + item.id
    }
}
