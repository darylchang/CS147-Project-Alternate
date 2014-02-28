
/*
 * GET home page.
 */

var models = require('../models');
var data = require('../data.json');

// HOW-TO: write JSON to file
var fs = require('fs');
// To make a permanent change:
// 1. Make sure using current data: data = require('../data.json')
// 2. Modify data JSON object (data.halls[0].property = newvalue, etc)
// 3. fs.writeFile('../data.json', JSON.stringify(data));


exports.view = function(req, res){
    var lastPage = req.session.lastPage;
    var username = req.session.username;
    var favoritesArr = []
    req.session.lastPage = '/';

    models.Hall
            .find()
            .populate('menu')
            .exec(callbackZero);

    function callbackZero(err, halls) {
      if(err) console.log(err);
      for(var i = 0; i < halls.length; i++) {
          var menu = halls[i].menu;
          halls[i].menu = menu;
      }

      var restHalls = halls.slice(2);
      halls = halls.slice(0, 2);
      
      if (!username){
        console.log("NO USERNAME");
        res.render('index', {
                       'lastPage': lastPage,
                       'halls': halls,
                       'restHalls': restHalls,
                       'username': req.session.username,
                       'isSearch': false,
                       'favorites': favoritesArr
                    });
      } else {
        models.User.findOne({'username': username}, callbackOne);
      }

      function callbackOne(err, user) {
        console.log('callbackOne');
        var favorites = user.favorites;
        var numLeft = favorites.length;
        if (favorites.length == 0) {
          console.log("NO FAVORITES");
          res.render('index', {
                       'lastPage': lastPage,
                       'halls': halls,
                       'restHalls': restHalls,
                       'username': req.session.username,
                       'isSearch': false,
                       'favorites': favoritesArr
                    });
        }

        for (var i=0; i<favorites.length; i++) {
            models.MenuItem.findOne({'_id': favorites[i].toString()}, callbackTwo);
        }

        function callbackTwo(err, menuItem) {
            console.log('callbackTwo');
            models.MenuItem.find()
                           .exec(callbackThree);
            
            function callbackThree(err, items) {
                console.log('callbackThree');
                var dining_halls = [];
                for (var i=0; i<items.length; i++) {
                    if (items[i].name == menuItem.name) {
                        var hall = items[i].dining_hall;
                        if (dining_halls.indexOf(hall) < 0) {
                            dining_halls.push(hall);
                        }
                    }
                }
                favoritesArr.push({
                    'name': menuItem.name,
                    'upvotes': menuItem.upvotes,
                    'downvotes': menuItem.downvotes,
                    'dining_halls': dining_halls
                });
                numLeft--;

                if (numLeft == 0) {
                    // Populate dining halls list
                    models.Hall
                          .find()
                          .populate('menu')
                          .exec(callbackFour);
                }

                function callbackFour(err, halls) {
                    console.log("callbackFour")
                    if(err) console.log(err);
                    for(var i = 0; i < halls.length; i++) {
                        var menu = halls[i].menu;
                        halls[i].menu = menu;
                    }
                    halls = halls.slice(0,2);
                    res.render('index', {
                       'lastPage': lastPage,
                       'halls': halls,
                       'restHalls': restHalls,
                       'username': req.session.username,
                       'isSearch': false,
                       'favorites': favoritesArr
                    });
                } 
            }
        }
    }
    }
};

exports.search = function(req, res) {
    req.session.lastPage = '/search/'+encodeURIComponent(req.params.searchtext);
    var text = req.params.searchtext;
    var searchTokens = text.split(/\s+/);
    var retHalls = [];

    // Search menus for matching hall/menu combos
    models.Hall
          .find()
          .populate('menu')
          .exec(function(err, halls) {
                if(err) { console.log(err); res.send(500) };

                for(var i = 0; i < halls.length; i++) {
                    var hall = halls[i];
                    var hallMenu = hall.menu;
                    var menuMatches = [];

                    for(var j = 0; j < hallMenu.length; j++) {
                        var menuItem = hallMenu[j];
                        var nameTokens = menuItem.name.split(/\s+/);
                        for(var tagIndex = 0; tagIndex < menuItem.tags.length; tagIndex++) {
                            nameTokens.push(menuItem.tags[tagIndex]);
                        }
                        var nameMatches = arrMatches(searchTokens, nameTokens);
                        if(nameMatches > 0) {
                            menuItem["relevance"] = nameMatches;
                            menuMatches.push(menuItem);
                        }
                    }

                    if (menuMatches.length > 0) {
                        sortMatches(menuMatches, 'relevance', false);
                        hall.menu = menuMatches;
                        retHalls.push(hall);
                    }
                }

                res.render('index', {
                    'halls': retHalls,
                    'isSearch': true,
                    'query': text
                });
            });
};

// Standard JSON sorting algorithm.
function sortMatches(menuMatches, prop, asc) {
    menuMatches.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        else return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
    });
}


function arrMatches(arr1, arr2) {
    var matches = 0;
    for(var i = 0; i < arr1.length; i++) {
        matches += matchesInArr(arr2, arr1[i]);
    }
    return matches;
}

function matchesInArr(arr, str) {
    str = str.toLowerCase();
    var matches = 0;
    for(var i = 0; i < arr.length; i++) {
        if(arr[i].toLowerCase() == str) {
            matches++;
        }
    }
    return matches;
}
