"use strict";

import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import { connectionArgs, connectionDefinitions, connectionFromArray, fromGlobalId, globalIdField, mutationWithClientMutationId, nodeDefinitions } from 'graphql-relay'
 import { User, Widget, getUser, getViewer, getWidget, getWidgets, Game, HidingSpot, getGame, getHidingSpot, getHidingSpots, getTurnsRemaining, checkHidingSpotForTreasure } from './database'
 /**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    switch (type) {
      case "User":
      return getUser(id)
      case "Widget":
      return getWidget(id)
      case "Game":
      return getGame(id)
      case "HidingSpot":
      return getHidingSpot(id)
      default:
      return null
    }
    if (type === 'User') {
      return getUser(id);
    } else if (type === 'Widget') {
      return getWidget(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Widget)  {
      return widgetType;
    } else if (obj instanceof Game)  {
      return gameType;
    } else if (obj instanceof HidingSpot)  {
      return hidingSpotType;
    } else {
      return null;
    }
  }
);



/**
 * Define your own types here
 */

var userType = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app',
  fields: () => ({
    id: globalIdField('User'),
    widgets: {
      type: widgetConnection,
      description: 'A person\'s collection of widgets',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(getWidgets(), args),
    },
  }),
  interfaces: [nodeInterface],
});

var widgetType = new GraphQLObjectType({
  name: 'Widget',
  description: 'A shiny widget',
  fields: () => ({
    id: globalIdField('Widget'),
    name: {
      type: GraphQLString,
      description: 'The name of the widget',
    },
  }),
  interfaces: [nodeInterface],
});

var gameType = new GraphQLObjectType({
  name: "Game",
  description: "A Game",
  fields: () => ({
    id: globalIdField('Game'),
    hidingSpots: {
      type: hidingSpotConnection,
      description: 'Places where a treasure might be hidden',
      args: connectionArgs,
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args)
    },
    turnsRemaining: {
      type: GraphQLInt,
      description: "The number of turns a player has left to find the treasure",
      resolve: () => getTurnsRemaining()
    }
  }),
  interfaces: [nodeInterface]
})

var hidingSpotType = new GraphQLObjectType({
  name: "HidingSpot",
  description: "A Hiding Spot",
  fields: () => ({
    id: globalIdField('HidingSpot'),
    hasBeenChecked: {
      type: GraphQLBoolean,
      description: "True if this spot has already been checked out for treasure",
      resolve: (hidingSpot) => hidingSpot.hasBeenChecked
    },
    hasTreasure: {
      type: GraphQLBoolean,
      description: "True if this hiding spot holds treasure",
      resolve: (hidingSpot) => {
        if (hidingSpot.hasBeenChecked) {
          return hidingSpot.hasTreasure;
        } else {
          return null;
        }
      }
    }
  }),
  interfaces: [nodeInterface]
})



/**
 * Define your own connection types here
 */
var {connectionType: widgetConnection} =
  connectionDefinitions({name: 'Widget', nodeType: widgetType});
var {connectionType: hidingSpotConnection} =
    connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});


/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var userQueryType = new GraphQLObjectType({
  name: 'UserQuery',
  fields: () => ({
    node: nodeField,
    viewer: {
      type: userType,
      resolve: () => getViewer(),
    },
  }),
});

var queryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    node: nodeField,
    game: {
      type: gameType,
      resolve: () => getGame()
    }
  })

})

var CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
  name: "CheckHidingSpotForTreasure",
  inputFields: {
    id: {type: new GraphQLNonNull(GraphQLID)}
  },
  outputFields: {
    hidingSpot: {
      type: hidingSpotType,
      resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId)
    },
    game: {
      type: gameType,
      resolve: () => getGame()
    }
  },
  mutateAndGetPayload: ({id, text}) => {
    var localHidingSpotId = fromGlobalId(id).id;
    checkHidingSpotForTreasure(localHidingSpotId);
    return {localHidingSpotId};
  }
})

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation
  })
});

var userMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
var Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});

var UserSchema = new GraphQLSchema({
  query: userQueryType,
  mutation: userMutationType
});

export {Schema, UserSchema}
