function helpAll(ctx){
    for (const key in ctx.commands){
        ctx.stdout += key + " : " + ctx.commands[key].HelpString + "\n";
    }
    return ctx;
}

export function help(ctx){
    let text = ctx.stdin;
    console.log(text);
    text = text.split(" ")[1]
    console.log(text)
    if (text === undefined){
        return helpAll(ctx);
    }else{
        text = text.trim()
        if (text in ctx.commands){
            ctx.stdout += text + " : " + ctx.commands[text].HelpString;
        }else{
            ctx.stdout += text + " : Unknown Command";
        }
    }

    return ctx;
}

