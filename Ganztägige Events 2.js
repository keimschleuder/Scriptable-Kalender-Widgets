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
        if (event.isAllDay && event.calendar.title != "Ferien") {
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
            })
        }
    }

    DATE_FORMATTER.dateFormat = "MMMM"

    if (itemsToShow.length == 0){
        itemsToShow.push({
            id: "Monat",
            name: DATE_FORMATTER.string(NOW)
        })
    }

    let divisor = 60 / itemsToShow.length
    let dividend = NOW.getMinutes()
    
    let show = 0
    while (dividend > divisor) {
        dividend = dividend - divisor
        show += 1
    }
    item = itemsToShow[show]

    // Lay out the widget!
    let widget = new ListWidget()

    // If there is at least one item today

    let itemName = widget.addText(item.name)
    itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
    
    // Finalize widget settings
    widget.setPadding(12, 12, 12, 0)
    widget.spacing = -3

    Script.setWidget(widget)
    widget.presentAccessoryInline()
    Script.complete()
}

// WIDGET TEXT HELPERS

function getItemUrl(item) {
    return CALENDAR_URL + item.id  
}