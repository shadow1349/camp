import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { User, Permissions } from '../types';

export const OnUserCreated = functions.auth.user().onCreate((user, context) => {
  const p: Permissions = {
    admin: false,
    authorized: false,
    user: false
  };

  admin
    .auth()
    .setCustomUserClaims(user.uid, p)
    .catch(e => {
      console.log(e);
    });

  return admin
    .firestore()
    .doc(`Users/${user.uid}`)
    .set({
      Id: user.uid,
      Email: user.email,
      Permissions: p,
      CreatedOn: new Date()
    });
});

export const OnUserUpdated = functions.firestore
  .document('Users/{UserId}')
  .onUpdate((change, context) => {
    const before = change.after.data() as User;
    const after = change.after.data() as User;

    if (
      before.Permissions.admin !== after.Permissions.admin ||
      before.Permissions.authorized !== after.Permissions.authorized ||
      before.Permissions.user ||
      after.Permissions.user
    ) {
      return admin.auth().setCustomUserClaims(context.params.UserId, after.Permissions);
    }

    return Promise.resolve(null);
  });

export const OnUserDeleted = functions.auth.user().onDelete((user, context) => {
  return admin
    .firestore()
    .doc(`Users/${user.uid}`)
    .delete();
});
