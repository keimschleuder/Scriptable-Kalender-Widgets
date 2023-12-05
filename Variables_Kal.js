// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: info;
class Variables_Kal {
    constructor() {
        this.TEST_MODE = true
        this.CALENDAR_URL = ""

        this.YOUR_NAME = "ToDo"
        this.VISIBLE_CALENDARS = ["Privat"]
        this.NO_ITEMS_MESSAGE = "Enjoy it." // what's displayed when you have no items for the day

        this.USE_BACKGROUND_IMAGE = true
        this.GREETING_COLOR = new Color("#eeeeee")
        this.DATE_COLOR = Color.red()
        this.ITEM_NAME_COLOR = Color.white()
        this.ITEM_TIME_COLOR = new Color("#eeeeee")

        this.CALENDAR_COLORS = {
            "Privat": Color.blue()
        }

        this.GREETING_SIZE = 16
        this.ITEM_NAME_SIZE = 14
        this.ITEM_TIME_SIZE = 12
        this.ITEM_TIME_FONT = "Menlo-Regular";
        this.DATE_SIZE = this.GREETING_SIZE
    }
}

module.exports = Variables_Kal;