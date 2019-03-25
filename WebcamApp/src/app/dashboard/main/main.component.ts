import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  socket: WebSocket;
  private Subscription = new Subscription();

  @ViewChild('video') Video: ElementRef;

  constructor(private auth: AuthService) {
    this.socket = new WebSocket(`ws://192.168.86.85:${environment.port}/camera`);
    this.socket.onopen = () => {
      this.ReadCamera();
    };

    this.socket.onmessage = ev => {
      this.Video.nativeElement.src = `data:image/jpeg;base64,${ev.data}`;
    };
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.Subscription.unsubscribe();
  }

  private ReadCamera() {
    this.Subscription.add(
      this.auth.GetIDToken().subscribe(x => {
        console.log(x);
        this.socket.send(JSON.stringify({ read: true, token: x }));
      })
    );
  }
}
