let serverUrl = 'http://localhost:3030';
if (process.env.SERVER_URL) {
    serverUrl = process.env.SERVER_URL
}
module.exports = {
    'base': serverUrl
};
