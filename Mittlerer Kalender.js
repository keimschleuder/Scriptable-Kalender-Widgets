// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calendar-alt;
const VKal = importModule("Variables_Kal")
const V = new VKal()

const TEST_MODE = V.TEST_MODE

const CALENDAR_URL = V.CALENDAR_URL

const YOUR_NAME = V.YOUR_NAME
const VISIBLE_CALENDARS = V.VISIBLE_CALENDARS
const NUM_ITEMS_TO_SHOW = 4 // 4 is the max without it being cramped
const NO_ITEMS_MESSAGE = V.NO_ITEMS_MESSAGE 

const GREETING_COLOR = V.GREETING_COLOR
const DATE_COLOR = V.DATE_COLOR
const ITEM_NAME_COLOR = V.ITEM_NAME_COLOR
const ITEM_TIME_COLOR = V.ITEM_TIME_COLOR

const CALENDAR_COLORS = V.CALENDAR_COLORS

const GREETING_SIZE = V.GREETING_SIZE
const ITEM_NAME_SIZE = V.ITEM_NAME_SIZE
const ITEM_TIME_SIZE = V.ITEM_TIME_SIZE
const ITEM_TIME_FONT = V.ITEM_TIME_FONT; 

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
    
    let widget = new ListWidget()

    // Add the top date and greeting
    let topStack = widget.addStack()
    topStack.layoutHorizontally()
    topStack.topAlignContent()
    
    // Greeting is left aligned, date is right aligned
    let greetingStack = topStack.addStack()
    let greeting = greetingStack.addText(getGreeting())
    greeting.textColor = GREETING_COLOR
    greeting.font = Font.lightSystemFont(GREETING_SIZE)
    
    topStack.addSpacer()
    
    let dateStack = topStack.addStack()
    DATE_FORMATTER.dateFormat = "EEEE d"
    let topDate = dateStack.addText(DATE_FORMATTER.string(NOW).toUpperCase())
    topDate.textColor = DATE_COLOR
    topDate.font = Font.semiboldSystemFont(GREETING_SIZE)
    
    const iCloud = FileManager.iCloud()
    let documents = iCloud.documentsDirectory()
    documents = documents + "/calendar/"
    const picture = documents + "Medium.jpg"
    widget.backgroundImage = iCloud.readImage(picture)
    
    // Put all of the event items on the bottom
    widget.addSpacer()

    // If there is at least one item today
    if (itemsToShow.length > 0) {      
        // Add a darker overlay
        let gradient = new LinearGradient()
        gradient.colors = [new Color("#000000", 0.75), new Color("#000000", 0.15)]
        gradient.locations = [0, 1]
        widget.backgroundGradient = gradient
    
        for (i = 0; i < itemsToShow.length; i++) {
            // Add space between events
            if (i != 0) {
                widget.addSpacer(12)
            }
            
            // Add nested stacks so everything aligns nicely...
            let itemStack = widget.addStack()
            itemStack.layoutHorizontally()
            itemStack.centerAlignContent()
            itemStack.url = getItemUrl(itemsToShow[i])
            
            let itemDate = itemStack.addText(formatItemDate(itemsToShow[i]))
            itemDate.font = new Font(ITEM_TIME_FONT, ITEM_TIME_SIZE)
            itemDate.textColor = ITEM_TIME_COLOR
            itemStack.addSpacer(12)
            
            let itemPrefix = itemStack.addText(formatItemPrefix(itemsToShow[i]))
            itemPrefix.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemPrefix.textColor = getItemColor(itemsToShow[i])
            itemStack.addSpacer(4)
            
            let itemName = itemStack.addText(formatItemName(itemsToShow[i]))
            itemName.lineLimit = 1
            itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
            itemName.textColor = ITEM_NAME_COLOR
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
    widget.setPadding(16, 16, 16, 16)
    widget.spacing = -3

    Script.setWidget(widget)
    widget.presentMedium()
    Script.complete()
}


// WIDGET TEXT HELPERS
function getGreeting() {
    let greeting = "Gute"
    if (NOW.getHours() < 6) {
        greeting = greeting + " Nacht, "
    } else if (NOW.getHours() < 10) {
        greeting = greeting + "n Morgen, "
    } else if (NOW.getHours() < 19) {
        greeting = "Hi, " 
    } else if (NOW.getHours() < 21) {
        greeting = greeting + "n Abend, "
    } else {
        greeting = greeting + " Nacht, "
    }
    return greeting + YOUR_NAME + "."
}

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
    DATE_FORMATTER.dateFormat = "hh:mma"
    if (item.dateIncludesTime === true) {
        if (item.startDate <= NOW){
            return "JETZT  "
        }
        return DATE_FORMATTER.string(item.startDate) // always 7 chars
    } else {
        return "HEUTE  "
    }
}

function formatItemName(item) {
    return item.name
}

function formatItemPrefix(item) {
    return "▐ "
}

function getItemUrl(item) {
    return CALENDAR_URL + item.id
}


function getItemColor(item) {
    return CALENDAR_COLORS[item.calendarTitle]
}
