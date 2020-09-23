module.exports = {
    calculateDistanceBetweenCities: (locA, locB) => (
        fetch('https://www.distance24.org/route.json?stops=' + locA + '|' + locB + '').then(res => res.json()).then(data => {
            return data.distance;
        })
    )
}