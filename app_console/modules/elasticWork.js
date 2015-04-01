/**
 * Created by okostiuk on 31.03.15.
 */
var client = require('../libs/elasticsearch');
var natural = require('natural');
module.exports = {
    isNumeric: function(num){
        if(isNaN(num)){
            return 0;
        } else return num;
    },
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
        if(str1 && str2){
            var res = natural.JaroWinklerDistance(str1,str2);
            return res*100;
        }
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
        var date =new Date();
        return yield client.search({
            index: 'search_index',
            type: 'search_type',
            body: {
                _source: ['realty_id', 'city_name', 'advert_type_name'],
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "default_field": "search_type.city_name",
                                    "query": "Винница"
                                }
                            },
                            {
                                "query_string": {
                                    "default_field": "search_type.advert_type_name",
                                    "query": "продажа"
                                }
                            },
                            {
                                "range": {
                                    "search_type.date_end.date_end_str": {
                                        "from": date
                                    }
                                }
                            }
                        ],
                        "must_not": [],
                        "should": []
                    }
                },
                "from": 0,
                "size": 100
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

                    var title1 = this.joinStr(res1[0].advert_type_name,res1[0].realty_type_name,res1[0].city_name,res1[0].district_name,res1[0].street_name);
                    var title2 = this.joinStr(res2[0].advert_type_name,res2[0].realty_type_name,res2[0].city_name,res2[0].district_name,res2[0].street_name);

                    var description1 = res1[0].description;
                    var description2 = res2[0].description;

                    var price1 = res1[0].price;
                    var price2 = res2[0].price;

                    var square1 = res1[0].total_square_meters;
                    var square2 = res2[0].total_square_meters;

                    var compareTitle = this.isNumeric(this.comparisonString(title1,title2));
                    var compareDecription = this.isNumeric(this.comparisonString(description1,description2));
                    var comparePrice = this.isNumeric(this.comparisonNumber(price1,price2));
                    var compareSquare = this.isNumeric(this.comparisonNumber(square1,square2));

                    var similarity = (compareTitle*0.45)+(compareDecription*0.3)+(comparePrice*0.1)+(compareSquare*0.15);

                    //console.log("Price "+comparePrice);
                   // console.log("Description "+compareDecription);
                    //console.log("Square "+compareSquare);
                    //console.log("Title "+compareTitle);
                    console.log("similarity: "+similarity);
                    console.log(res1[0].realty_id+" | "+res2[0].realty_id+"***************************************************************************");
                }
            }
        }
    }
}