const { existsSync, mkdirSync } = require("fs");
const { readFile, readdir, writeFile, appendFile } = require("fs/promises");
const { getDate, getHourMinute, parseSentence, getYear } = require("../utils");

const homeDir = require("os").homedir();
const notesFolder = `${homeDir}/notes`;

if (!existsSync(notesFolder)) {
    mkdirSync(notesFolder);
}

/**
 *
 * @param {*} date in format dd/mm/yyyy
 * @returns
 */
async function getNotesOnDate(date) {
    if (!date) return console.error("Please enter a date");
    const dateArr = date.split("/");
    let day = dateArr[0];
    let month = dateArr[1];
    let year = dateArr[2] ?? getYear();

    if (day.startsWith("0")) {
        day = day.slice(1);
    }

    if (month.startsWith("0")) {
        month = month.slice(1);
    }

    try {
        const files = await readdir(notesFolder);
        const find = files.filter((file) =>
            file.includes(`${day}_${month}_${year}`)
        )[0];
        if (!find)
            return console.error(
                `Unable to find notes on ${day}/${month}/${year}`
            );
        const data = await readFile(`${notesFolder}/${find}`, "utf-8");
        console.log(data);
    } catch (err) {
        return console.error(err);
    }
}

async function addSingleNote(body) {
    if (body.trim().length === 0) return console.error("Empty note!!");
    const date = getDate();
    const currentHourMin = getHourMinute();

    const endFile = `${notesFolder}/${date}.md`;
    try {
        if (!existsSync(endFile)) {
            await writeFile(endFile, `# ${getDate("/")}\n`);
        }

        let addedText = `## ${currentHourMin}\n${body}\n\n`;

        const data = await readFile(endFile, "utf-8");
        var arr = data.split("\n").filter((s) => s);

        // Find the last added hour:minute
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i].startsWith("##")) {
                const lastHourMinute = arr[i].split(" ")[1].trim();

                if (lastHourMinute == currentHourMin) {
                    addedText = `${body}\n`;
                } else {
                    addedText = `## ${currentHourMin}\n${body}\n`;
                }
                break;
            }
        }

        await appendFile(endFile, addedText);
    } catch (err) {
        return console.error("Unable to add note. Error: " + err);
    }
}

module.exports = {
    getNotesOnDate: getNotesOnDate,
    addSingleNote: addSingleNote,
    notesFolder: notesFolder,
};