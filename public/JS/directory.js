
const rootDir = new Directory(null, "root", {});
rootDir.routes["main.c"] = new FileData("main.c", "README.html")
rootDir.routes["project/"] = new Directory(rootDir, "project", {"http.h" : new FileData("http/http.h", "http/http_README.html")})
rootDir.routes["project/"].routes["testing.h"] = new FileData("tools/Test/Testing.h", "tools/Test/README.html");

export let curDir = rootDir

export let path = [];

/**
 * @constructor
 * @param {Directory} parent
 * @param {string} name
 * @param routes
 */
function Directory(parent, name, routes){
    this.name = name;
    this.parent = parent;
    this.routes = routes;
}

/**
 *
 * @param {string} route
 * @param {string} about
 * @constructor
 */
function FileData(route, about){
    this.route = route;
    this.about = about;
}


export function changeDir(ctx){
    let newDir = ctx.stdin.split(" ")[1]
    if (newDir === undefined){
        ctx.stdout += "Incorrect usage of cd command: cd {directory name}"
        return ctx;
    }
    newDir = newDir.trim()
    if (newDir === ".."){
        if (curDir.parent !== null){
            curDir = curDir.parent
            path.pop()
            return ctx;
        }
    }
    console.log(ctx.directory.routes)
    for (const dir of Object.keys(ctx.directory.routes)){
        console.log(dir)
        const value = ctx.directory.routes[dir]
        if (!(value instanceof Directory)){
            if (newDir === dir){
                ctx.stdout += newDir +" is not a directory"
                return ctx
            }
            continue;
        }
        if (value.name === newDir) {
            curDir = value;
            path.push(dir)
            return ctx;
        }
    }
    ctx.stdout += newDir + " is not a child of " + curDir.name;
    return ctx
}



