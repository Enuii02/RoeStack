export const getElapsedTime = (date) => {
    const dateNow = new Date();

    const past = new Date(date);

    const diffMs = dateNow - past; 
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    }

    if (minutes < 60) {
        return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
    }

    if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
    }

    return days + (days === 1 ? " day ago" : " days ago");
};


export const log = (message) => {
    console.log("[@] - " + message);
}
