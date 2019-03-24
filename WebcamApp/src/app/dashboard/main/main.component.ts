import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  socket: WebSocket;

  @ViewChild('video') Video: ElementRef;

  constructor() {
    this.socket = new WebSocket(`ws://${window.location.hostname}:${environment.port}`);
    this.socket.onopen = () => {
      console.log('CONNECTED');
      this.ReadCamera();
    };

    this.socket.onmessage = ev => {
      this.Video.nativeElement.src = `data:img/jped:base64,${ev.data}`;
    };
  }

  ngOnInit() {}

  private ReadCamera() {
    this.socket.send('read_camera');
  }
}
