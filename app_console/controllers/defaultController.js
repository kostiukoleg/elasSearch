"use strict";
var elasticWork = require('../modules/elasticWork');
(function () {

    /**
     * @module controllers/defaultController
     */
    module.exports = {
        index : function* (options) {
            yield elasticWork.compareAds();
        }
    };
}());