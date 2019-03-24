import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { Observable } from 'rxjs';
import { AppUser } from 'src/app/types';
import { switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  CurrentUser: Observable<User>;
  DBUser: Observable<AppUser>;

  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.CurrentUser = this.auth.user;
    this.DBUser = this.auth.user.pipe(
      switchMap(user => this.db.doc<AppUser>(`Users/${user.uid}`).valueChanges())
    );
  }

  GetIDToken() {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) {
          return;
        }
        return user.getIdToken(true);
      })
    );
  }

  Login(email: string, password: string) {
    return this.auth.auth.signInWithEmailAndPassword(email, password).catch(e => {
      alert('Error Signing In');
    });
  }
}
