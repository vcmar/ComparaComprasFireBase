import { ProductVersion } from './../app/models/product-version';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyC6FAKCDSpNTKwxoUnetaHfNfEKZxdHMyc',
    authDomain: 'comparacompras-dev.firebaseapp.com',
    databaseURL: 'https://comparacompras-dev.firebaseio.com',
    projectId: 'comparacompras-dev',
    storageBucket: 'comparacompras-dev.appspot.com',
    messagingSenderId: '539818857304',
    appId: '1:539818857304:web:14da82c64296c66895cb2d',
    measurementId: 'G-PBB268CQ8F'
  },
  appVersion: require('../../package.json').version + '-dev'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
