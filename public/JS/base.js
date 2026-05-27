const input = document.getElementById("inputBox");
const out = document.getElementById("out");
const pathValue = document.getElementById("path");

// Keep typing working like a terminal when the window is focused
window.addEventListener("keydown", (e) => {
    // don't steal typing from real input/textarea or modifier shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Tab") return;

    const tag = document.activeElement?.tagName;
    const isTypingField = tag === "INPUT" || tag === "TEXTAREA";

    if (!isTypingField) input.focus();
});

// Also refocus when the user clicks anywhere
window.addEventListener("mousedown", () => input.focus());

input.addEventListener("keydown", async (e) => {

    if (commandList.length !== 0 ){
        if (e.key === "ArrowDown"){
            e.preventDefault();
            console.log(commandIndex);
            console.log(commandList);
            if (commandIndex + 1 === commandList.length){
                e.target.value = "";
                return;
            }
            commandIndex++;
            e.target.value = commandList[commandIndex];
            return;
        }

        if (e.key === "ArrowUp"){
            e.preventDefault();
            console.log(commandIndex)
            console.log(commandList)
            if (commandIndex === 0){
                e.target.value = commandList[commandIndex];
                return;
            }
            e.target.value = commandList[commandIndex];
            commandIndex--;
            return;
        }
    }

    if (e.key === "Enter") {
        e.preventDefault();

        const line = e.target.value;
        e.target.value = "";

        await handleCommand(line);
    }
});

import {help} from "./help.js"
import {list} from "./list.js"
import {changeDir, curDir, path} from "./directory.js"
import {cat} from "./cat.js"

let commandIndex = 0;
const commandList =  [];

function clearScreen() {
    out.textContent = "";
    return new Ctx(null, "", null, null)
}

function printLine(text) {
    if (text === "") {
        return;
    }
    out.innerHTML += text + "\n";
    // optional: scroll to bottom if you later make this scrollable
    window.scrollTo(0, document.body.scrollHeight);
}

async function handleCommand(line) {
    if (commandList[commandList.length-1] !== line){
        commandList.push(line)
    }
    commandIndex = commandList.length-1;
    // echo what they typed (terminal behavior)
    printLine(pathValue.innerText + " " + line);

    const cmdName = line.trim().split(/\s+/)[0]; // first token, ignores extra spaces
    if (!cmdName) return; // user hit enter on empty line

    const cmd = commands[cmdName];
    if (!cmd || !cmd.Function) {
        printLine(`Command not found: ${cmdName}`);
        return;
    }

    try {
        const ctxIn = new Ctx(commands, "", line, curDir);

        console.log(ctxIn);
        // works whether cmd.Function returns ctx or Promise<ctx>
        const ctxOut = await Promise.resolve(cmd.Function(ctxIn));
        pathValue.innerText = path.join("/") + "> "

        if (ctxOut?.stdout) {
            printLine(ctxOut.stdout);
        }
    } catch (err) {
        console.error(err);
        printLine(`Error running ${cmdName}`);
    }

}


function Command(functionEntry, HelpString) {
    this.Function = functionEntry;
    this.HelpString = HelpString;
}


function Ctx(commands, stdout, stdin, dir) {
    this.stdout = stdout;
    this.stdin = stdin;
    this.commands = commands;
    this.directory = dir;
}

function Route(type, name) {
    this.type = type;
    this.name = name;
}


const commands = {
    "clear": new Command(clearScreen, "This Function Clears the screen of all previous command outputs"),
    "help": new Command(help, "This shows the help string for a given command"),
    "ls": new Command(list, "This will list all of the directories available in the current directories"),
    "cat": new Command(cat, "This will print the contents of the file you pass as an argument."),
    "cd": new Command(changeDir, "This will change the current directory to the selected dir."),
}
