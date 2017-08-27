var JSONStream = require('JSONStream');
const fs = require('fs');

const days = new Map();
const baseLocation = {
    latitude: -23.5283406,
    longitude: -47.4650814
};

const maxDistance = 100; //Meters
const dateFilter = new Date(2017, 7, 1);

const calculateDistance = (location1, location2) => {
    const R = 6378.137; // Radius of earth in KM
    const dLat = location2.latitude * Math.PI / 180 - location1.latitude * Math.PI / 180;
    const dLon = location2.longitude * Math.PI / 180 - location1.longitude * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location1.latitude * Math.PI / 180) * Math.cos(location2.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.abs(d * 1000); // meters
}

const isBaseLocation = (location) => {
    return calculateDistance(location, baseLocation) <= maxDistance;
};

const stream = fs.createReadStream('location-history.json', {
    encoding: 'utf8'
});
const parser = JSONStream.parse('locations.*');

stream.pipe(parser)
    .on('data', (data) => {
        const location = {
            date: new Date(Number(data.timestampMs)),
            latitude: data.latitudeE7 / 10000000,
            longitude: data.longitudeE7 / 10000000,
            accuracy: data.accuracy
        };

        if (!location.latitude || !location.longitude || location.date < dateFilter || location.accuracy > 100) {
            return;
        }
        if (days.has(location.date.toDateString())) {
            const day = days.get(location.date.toDateString());
            day.push(location);
        } else {
            days.set(location.date.toDateString(), [location]);
        }
    }).on('close', () => {
        console.log(`Found ${days.size} days with data`);
        days.forEach((value, key, map) => {
            if (!value.find(isBaseLocation)) {
                days.delete(key);
                return;
            }
            value.sort((a, b) => a.date - b.date);
            let timeArrivedInLocation;
            const totalTimeSpent = value.reduce((timeSpent, location) => {
                if (isBaseLocation(location)) {
                    if (!timeArrivedInLocation) {
                        console.log(location.date.toLocaleDateString(), ' Arrived at ',
                            location.date.toLocaleTimeString());
                        timeArrivedInLocation = location.date;
                    }
                } else {
                    if (timeArrivedInLocation) {
                        console.log('Leaving the place at',
                            location.date.toLocaleTimeString(),
                            'lat:', location.latitude, 'lon:', location.longitude,
                            'dist', calculateDistance(location, baseLocation), 'acc', location.accuracy);
                        timeSpent += location.date - timeArrivedInLocation;
                        timeArrivedInLocation = null;
                    }
                }
                return timeSpent;
            }, 0);
            const d = new Date(totalTimeSpent);
            const seconds = d.getSeconds();
            const minutes = d.getMinutes();
            const hours = d.getHours();

            console.log(`Total time in place ${totalTimeSpent / (1000 * 60 * 60)} ${hours}:${minutes < 10 ? '0' : ''}${minutes}.${seconds}`);
        }, 0);
        console.log(`Found ${days.size} days that you where near the specified location`);

    });

module.exports = {
    calculateDistance
}