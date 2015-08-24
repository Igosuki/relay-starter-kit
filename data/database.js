"use strict";

/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// Model types
class User extends Object {}
class Widget extends Object {}
class Game extends Object {}
class HidingSpot extends Object {}

// Mock data
var viewer = new User();
viewer.id = '1';
viewer.name = 'Anonymous';

var widgets = ['What\'s-it', 'Who\'s-it', 'How\'s-it'].map((name, i) => {
  var widget = new Widget();
  widget.name = name;
  widget.id = `${i}`;
  return widget;
});

var game = new Game();
game.id = '1';

var hidingSpots = [];
(function() {
  var hidingSpot;
  var indexOfSpotWithTreasure = Math.floor(Math.random() * 9);
  for (var i = 0; i < 9; i++) {
    hidingSpot = new HidingSpot();
    hidingSpot.id = `${i}`;
    hidingSpot.hasTreasure = (i === indexOfSpotWithTreasure);
    hidingSpot.hasBeenChecked = false;
    hidingSpots.push(hidingSpot);
  }
})();

var turnsRemaining = 3;
var getWidgets = () => widgets
var getHidingSpot = function(id) {
  return hidingSpots.find(hs => hs.id === id)
};

module.exports = {
  // Export methods that your schema can use to interact with your database
  getUser: (id) => id === viewer.id ? viewer : null,
  getViewer: () => viewer,
  getWidget: (id) => widgets.find(w => w.id === id),
  getWidgets: getWidgets,
  User,
  Widget,
  checkHidingSpotForTreasure: function(id) {
    if (hidingSpots.some(hs => hs.hasTreasure && hs.hasBeenChecked)) {
      return;
    }
    turnsRemaining--;
    var hidingSpot = getHidingSpot(id);
    hidingSpot.hasBeenChecked = true;
  },
  getHidingSpot: getHidingSpot,
  getGame: () => game,
  getHidingSpots: () => {
    return hidingSpots
  },
  getTurnsRemaining: () => turnsRemaining
};
