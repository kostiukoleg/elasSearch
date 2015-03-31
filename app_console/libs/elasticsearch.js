/**
 * Created by okostiuk on 31.03.15.
 */
var elasticsearch = require('elasticsearch');
var config = require('config');

var client = new elasticsearch.Client(config.elasticsearch);

module.exports = client;