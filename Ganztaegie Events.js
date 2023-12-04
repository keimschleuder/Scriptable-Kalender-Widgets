// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: calendar-alt;
const TEST_MODE = true

const CALENDAR_URL = ""

const VISIBLE_CALENDARS = ["Privat", "Schule", "Freizeit", "Kirche", "Orchester", "Family", "Spezial"]
const NUM_ITEMS_TO_SHOW = 1 // 1 is the max without it being cramped
const NO_ITEMS_MESSAGE = "Enjoy it." // what's displayed when you have no items for the day
const ITEM_NAME_SIZE = 14

const DATE_FORMATTER = new DateFormatter()
const NOW = new Date()

const Gruessen = importModule('Gruessen')

let gruesseNiklas = new Gruessen("Herr Keim", "Niklas")

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
        if (event.isAllDay) {
            itemsToShow.push({
                id: event.identifier,
                name: event.title,
            })
        }
    }

    itemsToShow.push({
        id: "Hi",
        name: gruesseNiklas.informellGruessen()
    })

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

    if (itemsToShow.length > 0) {
        let itemName = widget.addText(item.name)
        itemName.font = Font.semiboldSystemFont(ITEM_NAME_SIZE)
    } else { // If there are no more items today
        // No events found:
        let message = widget.addText(NO_ITEMS_MESSAGE)
        message.font = Font.lightSystemFont(ITEM_NAME_SIZE)  
    }

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