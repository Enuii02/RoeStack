

export const getElapsedTime = (date) => {

    var dateNow = new Date();

    var seconds = Math.floor((date - (dateNow))/1000*-1);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);

    if (hours === 0 && days === 0) {
        return "Just now"
    }
    
    if (hours < 24 && days === 0) {
        return hours + ((hours === 1) ? " hour ago" : " hours ago")
    } else {
        return days + ((days === 1) ? " day ago" : " days ago")
    }
}
