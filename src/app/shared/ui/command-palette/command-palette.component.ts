import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { CommandService, CommandItem } from '../../../core/services/command.service';
import { ICONS } from '../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
})
export class CommandPaletteComponent implements AfterViewInit, OnDestroy {
  private commandService = inject(CommandService);
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;

  readonly open = this.commandService.open;
  readonly query = signal('');
  readonly selectedIndex = signal(0);

  readonly filteredItems = computed(() => {
    const q = this.query().toLowerCase();
    const items = this.commandService.items();
    if (!q) return items;
    return items.filter(i => i.label.toLowerCase().includes(q));
  });

  readonly groupedItems = computed(() => {
    const items = this.filteredItems();
    const groups: { name: string; items: CommandItem[] }[] = [];
    const groupMap = new Map<string, CommandItem[]>();

    items.forEach(item => {
      const group = item.group || 'General';
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
        groups.push({ name: group, items: groupMap.get(group)! });
      }
      groupMap.get(group)!.push(item);
    });

    return groups;
  });

  ngAfterViewInit(): void {
    if (this.open()) {
      this.inputRef?.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.selectedIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredItems();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => (i - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = items[this.selectedIndex()];
      if (selected) {
        selected.action();
        this.commandService.close();
      }
    } else if (event.key === 'Escape') {
      this.commandService.close();
    }
  }

  onBackdropClick(): void {
    this.commandService.close();
  }

  selectItem(item: CommandItem): void {
    item.action();
    this.commandService.close();
  }
}
