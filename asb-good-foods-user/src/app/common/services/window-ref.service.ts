import { Injectable } from '@angular/core';

export interface IcustomWindow extends Window{
  _custom_global_staff: string;
}

function getWindow(): any{
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  get nativeWindow():IcustomWindow {
    return getWindow();
  }
}
