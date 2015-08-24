export default class extends Relay.Route {
  static path = '/users';
  static queries = {
    viewer: (Component) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('viewer')},
        },
      }
    `,
  };
  static routeName = 'AppUsersRoute';
}
