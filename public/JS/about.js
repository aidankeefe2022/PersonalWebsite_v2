export async function about(ctx) {
    let file = ctx.stdin.split(" ")[1];

    if (!file) {
        ctx.stdout += "File not found";
        return ctx;
    }

    try {
        const response = await fetch("/" + ctx.directory.routes[file].about);

        if (!response.ok) {
            ctx.stdout += "File not found";
            return ctx;
        }

        const data = await response.text();   // <-- important
        ctx.stdout += data;

    } catch (err) {
        console.error(err);
        ctx.stdout += "Network error";
    }

    return ctx;
}
