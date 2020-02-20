
function formatRange(range)
{
    let result = "";   
    let day = 0;
    let month = 0;

    if(range.length < 2) {
        day = range[0].getDate();
        month = range[0].getMonth() + 1;
        result += (day < 9? "0" + day: day) + "/" +
            (month < 9? "0" + month: month) + "/" +
            range[0].getFullYear();
    } else {
        const last = range.length - 1;
        if (range[0].getMonth() + 1 != range[last].getMonth() + 1) {
            day = range[0].getDate();
            month = range[0].getMonth() + 1;
            result += (day < 9? "0" + day: day) + "/" +
                (month < 9? "0" + month: month) + "/" +
                range[0].getFullYear() + " - ";

            day = range[last].getDate();
            month = range[last].getMonth() + 1;

            result += (day < 9? "0" + day: day) + "/" +
                (month < 9? "0" + month: month) + "/" +
                range[last].getFullYear();
        } else {
            day = range[0].getDate();
            month = range[0].getMonth() + 1;

            result += (day < 9? "0" + day: day) + " - ";
            day = range[last].getDate();

            result += (day < 9? "0" + day: day) + "/" +
            (month < 9? "0" + month: month) + "/" +
            range[last].getFullYear();
        }
    }
    return result;
}
/**
 * 
 * @param {Date[]} dates 
 * 
 * Creates a string that represent the list of dates in an array
 * if there are contiguous dates it will display them as a range.
 */
export function formatDateArr( dates ) {
    let range = [];
    let result = "";

    dates = dates.map((dateStr) => new Date(dateStr) );
    dates.sort((a,b) => {
        return a < b? -1 : a > b? 1 : 0; 
    });

    for (let index = 0; index < dates.length; index++) {
        let diff = 0;
        let date = dates[index];

        if(range.length > 0)
            diff = ( date.getTime() - range[range.length - 1].getTime() ) / (1000 * 3600 * 24);
        if( range.length == 0 || diff == 1)
        {
            range.push(date);
            continue;
        }
        result += ((result !== "")? ", " : "") + formatRange(range);
        range = [date];
    }

    if(range.length > 0)
        result += ((result !== "")? ", " : "") + formatRange(range);
    return result;
}