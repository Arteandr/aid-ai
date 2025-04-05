import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiForm, TuiSearch } from '@taiga-ui/layout';
import { TuiSelectModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TuiSearch,
    TuiTextfield,
    TuiSelectModule,
    TuiIcon,
    TuiDataListWrapper,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiForm,
    TuiButton,
  ],
})
export default class ChatPageComponent {
  filterForm = new FormGroup({
    search: new FormControl(''),
    filter: new FormControl('Все'),
  });
  items = ['Все', 'Открытые', 'Закрытые'];
}
