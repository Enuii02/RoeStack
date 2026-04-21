export const getElapsedTime = (date) => {
    const now = new Date();
    const past = new Date(date);

    const diffMs = now - past;
    if (isNaN(diffMs)) return "Invalid date";

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return days + (days === 1 ? " day ago" : " days ago");
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return months + (months === 1 ? " month ago" : " months ago");
    }

    const years = Math.floor(days / 365);
    return years + (years === 1 ? " year ago" : " years ago");
};


export const log = (message) => {
    console.log("[@] - " + message);
}
