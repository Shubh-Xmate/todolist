exports.getDate = getDate;

function getDate()
{
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date();

    today = today.toLocaleDateString("en-US", options);
    return today;
}