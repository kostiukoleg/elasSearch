module.exports = {
    "app": {
        "name": 'myKoajsRestApp',
        "version": '0.1.0'
    },
    "port":27017,
    "mongoose": {
        "uri": "mongodb://127.0.0.1:27017/ads",
        "options": {
            "server": {
                "socketOptions": {
                    "keepAlive": 1
                }
            }
        }
    },
    "elasticsearch": {
        "host": "10.1.18.18:9200"//,
        //"log": "trace"
    }
};