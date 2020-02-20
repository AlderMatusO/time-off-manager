
export const StringFormat = (str, ...args) => {
    let a = str;
    for(var k in args) {
        a = a.replace(new RegExp("\\{" + k + "\\}", "g"), args[k]);
    }
    return a;
}