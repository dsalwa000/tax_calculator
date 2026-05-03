import { Component, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ProgPodatkowy, TaxCalculatorService } from './tax-calculator-service';


@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  template: `
  <h1>{{ title() }}</h1>
  <form [formGroup]="calucationForm" (ngSubmit)="calculate()" class="tax-form">
    <mat-form-field class="example-full-width">
      <mat-label>Kwota roczna brutto</mat-label>
      <input
        matInput
        formControlName="brutto"
        placeholder="Wpisz roczną kwotę brutto"
      >
    </mat-form-field>
    @if (
      (calucationForm.get('brutto')?.touched || calucationForm.get('brutto')?.dirty) &&
      calucationForm.get('brutto')?.invalid
    ) {
      @if (calucationForm.get('brutto')?.errors?.['required']) {
        <small class="error-alert">Pole wymagane.</small>
      }
      @if (calucationForm.get('brutto')?.errors?.['min']) {
        <small class="error-alert">Kwota jest za mała.</small>
      }
      @if (calucationForm.get('brutto')?.errors?.['pattern']) {
        <small class="error-alert">Zły format!</small>
      }
    }
      <span class="example-list-section">
      <mat-checkbox
        class="example-margin"
        formControlName="pit2"
      >
        Czy masz deklarację PIT-2?
      </mat-checkbox>
    </span>
    <button type="submit" matButton="filled">Oblicz!</button>
  </form>
  @if (calculated()) {
    <h2>Obecnie łapisz się w <u>{{ progPodatkowy() }}</u> progu podatkowym.</h2>
    <table class="results-table">
      <tbody>
        <tr>
          <th>Kategoria</th>
          <th>Suma w PLN</th>
        </tr>
        <tr>
          <td>Brutto rocznie</td>
          <td>{{ bruttoRocznie() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Brutto miesięcznie</td>
          <td>{{ bruttoMiesiecznie() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Składki społeczne</td>
          <td>{{ skladkiSpoleczne() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Składka zdrowotna</td>
          <td>{{ skladkaZdrowotna() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Dochód - od tego zależy próg podatkowy</td>
          <td>{{ dochod() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Zapłacony podatek</td>
          <td>{{ podatek() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Netto rocznie</td>
          <td>{{ nettoRocznie() | number:'1.2-2' }}</td>
        </tr>
        <tr>
          <td>Netto miesięcznie</td>
          <td>{{ nettoMiesiecznie() | number:'1.2-2' }}</td>
        </tr>
        @if (zaliczkaRozliczeniePIT() !== 0) {
          <tr>
            <td>Zaliczka do odbioru podczas rozliczania PIT</td>
            <td>{{ zaliczkaRozliczeniePIT() | number:'1.2-2' }}</td>
          </tr>
        }
      </tbody>
    </table>

    <h3>Próg podatkowy zależy od dochodu</h3>
    <ul>
      <li>pierwszy próg do <b>120 000 PLN</b></li>
      <li>drugi próg do do <b>1 000 000 PLN</b></li>
    </ul>
  }
  `,
  styleUrl: './app.scss'
})
export class App {
  private fb = inject(FormBuilder)
  private taxCalculatorService = inject(TaxCalculatorService)
  protected readonly title = signal('Kalkulator UOP 🏧');

  skladkiSpoleczne = signal<number | null>(null);
  skladkaZdrowotna = signal<number | null>(null);
  dochod = signal<number | null>(null);
  podatek = signal<number | null>(null);
  nettoRocznie = signal<number | null>(null);
  nettoMiesiecznie = signal<number | null>(null);
  bruttoMiesiecznie = signal<number | null>(null);
  bruttoRocznie = signal<number | null>(null);
  calculated = signal<boolean>(false);
  progPodatkowy = signal<ProgPodatkowy>(ProgPodatkowy.PIERWSZY)
  zaliczkaRozliczeniePIT = signal<number>(0)

  calucationForm = this.fb.group({
    brutto: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
    pit2: [false]
  })

  calculate() {
    if (this.calucationForm.invalid) {
      this.calucationForm.markAllAsTouched();

      this.skladkiSpoleczne.set(null);
      this.skladkaZdrowotna.set(null);
      this.dochod.set(null);
      this.podatek.set(null);
      this.nettoRocznie.set(null);
      this.nettoMiesiecznie.set(null);
      this.calculated.set(false);
      return;
    }

    const brutto = Number(this.calucationForm.get('brutto')?.value);
    const pit2 = Number(this.calucationForm.get('pit2')?.value);

    const { progPodatkowy, skladkiSpoleczne, skladkaZdrowotna, dochod, podatek, nettoRocznie, nettoMiesiecznie } =
      this.taxCalculatorService.calculate(brutto);

    this.bruttoRocznie.set(brutto);
    this.bruttoMiesiecznie.set(brutto / 12);
    this.skladkiSpoleczne.set(skladkiSpoleczne);
    this.skladkaZdrowotna.set(skladkaZdrowotna);
    this.dochod.set(dochod);
    this.podatek.set(podatek);
    this.nettoRocznie.set(nettoRocznie);
    if (!pit2) {
      this.nettoMiesiecznie.set(nettoMiesiecznie - 300);
      this.zaliczkaRozliczeniePIT.set(3600);
    } else {
      this.nettoMiesiecznie.set(nettoMiesiecznie);
      this.zaliczkaRozliczeniePIT.set(0);
    }
    this.progPodatkowy.set(progPodatkowy)

    this.calculated.set(true)
  }
}
