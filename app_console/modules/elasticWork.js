/**
 * Created by okostiuk on 31.03.15.
 */
var client = require('../libs/elasticsearch');
var natural = require('natural');
module.exports = {
    comparisonNumber: function (num1,num2){
    var res;
    if (num1>=num2){
        res = (num2/(num1/100)-100);
    } else {
        res = (num1/(num2/100)-100);
    }
    return 100-Math.abs(res);
    },

    comparisonString: function (str1,str2){
        var res = natural.JaroWinklerDistance(str1,str2);
        return res*100;
    },

    elasticSearch: function* (id){
        return yield client.search({
            index: 'search_index',
            type: 'search_type',
            body:{
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "search_type.realty_id": id
                                }
                            }
                        ],
                        "must_not": [ ],
                        "should": [ ]
                    }
                },
                "from": 0,
                "size": 10,
                "sort": [ ],
                "facets": { }
            }
        })
    },

    searchAds: function* (id){
        var resp = yield this.elasticSearch(id);
        var hits = resp.hits.hits;
        var res = [];
        hits.forEach(function(itm){
            res.push(itm._source);
        });
        return res;
    },

    elastSearchAll: function*(){
        return yield client.search({
            index: 'search_index',
            type: 'search_type',
            body: {
                _source: ['realty_id', 'city_name', 'advert_type_name'],
                query: {
                    bool: {
                        must: [
                            {
                                query_string: {
                                    default_field: "search_type.city_name",
                                    query: "Винница"
                                }
                            },
                            {
                                query_string: {
                                    default_field: "search_type.advert_type_name",
                                    query: "продажа"
                                }
                            },
                            {
                                query_string: {
                                    default_field: "search_type.date_end",
                                    query: "продажа"
                                }
                            }
                        ],
                        must_not: [],
                        should: []
                    }
                },
                from: 0,
                size: 100
            }
        });
    },

    resultAll: function*(){
        var resp = yield this.elastSearchAll();
        var hits = resp.hits.hits;
        var res = [];
        hits.forEach(function(itm){
            res.push(itm._source.realty_id);
        });
        return res;
    },

    joinStr: function(str1,str2,str3,str4,str5){
        var arr = [];
        var str = "";
        arr.push(str1,str2,str3,str4,str5);
        arr = arr.filter(function(e){return e});
        str = arr.join(', ');
        return str;
    },

    compareAds: function*(){
        var arr1 = yield this.resultAll();
        var arr2 = yield this.resultAll();

        for( var i = 0; i < arr1.length-1; i++ ){
            for( var j = i+1; j < arr2.length; j++ ){
                if(arr1[i] !== arr2[j]){

                    res1 = yield this.searchAds(arr1[i]);
                    res2 = yield this.searchAds(arr1[j]);

                    var price1 = res1[0].price;
                    var price2 = res2[0].price;

                    console.log("Price "+this.comparisonNumber(price1,price2));

                    var description1 = res1[0].description;
                    var description2 = res2[0].description;

                    console.log("Description "+this.comparisonString(description1,description2));

                    var square1 = res1[0].total_square_meters;
                    var square2 = res2[0].total_square_meters;

                    console.log("Square "+this.comparisonNumber(square1,square2));

                    var searchId1 = this.joinStr(res1[0].advert_type_name,res1[0].realty_type_name,res1[0].city_name,res1[0].district_name,res1[0].street_name);
                    var searchId2 = this.joinStr(res2[0].advert_type_name,res2[0].realty_type_name,res2[0].city_name,res2[0].district_name,res2[0].street_name);

                    console.log("Title "+this.comparisonString(searchId1,searchId2));
                    console.log("ADS number "+res1[0].realty_id+" | "+res2[0].realty_id);
                    console.log("***************************************************************************");
                }
            }
        }
    }
}