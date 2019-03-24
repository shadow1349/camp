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
    this.socket = new WebSocket(`ws://${environment.device}:${environment.port}`);
    this.socket.onopen = () => {
      this.ReadCamera();
    };

    this.socket.onmessage = ev => {
      this.Video.nativeElement.src = `data:img/jped:base64,${ev.data}`;
    };
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.Subscription.unsubscribe();
  }

  private ReadCamera() {
    this.Subscription.add(
      this.auth.GetIDToken().subscribe(x => {
        this.socket.send(`read_${x}`);
      })
    );
  }
}
