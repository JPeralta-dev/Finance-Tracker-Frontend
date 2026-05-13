import { Injectable, signal, computed } from '@angular/core';

export interface CommandItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  group?: string;
  action: () => void;
}

@Injectable({ providedIn: 'root' })
export class CommandService {
  private readonly _items = signal<CommandItem[]>([]);
  readonly items = this._items.asReadonly();

  private readonly _open = signal(false);
  readonly open = this._open.asReadonly();

  register(items: CommandItem[]): void {
    this._items.set([...this._items(), ...items]);
  }

  unregister(ids: string[]): void {
    this._items.update(current => current.filter(i => !ids.includes(i.id)));
  }

  toggle(): void {
    this._open.update(v => !v);
  }

  close(): void {
    this._open.set(false);
  }

  openPalette(): void {
    this._open.set(true);
  }
}
