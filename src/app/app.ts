import { Component, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ProgPodatkowy, SalaryResult, TaxCalculatorService } from './tax-calculator-service';


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
      <mat-label>Kwota brutto</mat-label>
      <input
        matInput
        formControlName="brutto"
        placeholder="Wprwadź przynajmniej minimalną krajową brutto"
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
        Czy nie masz złozonej deklaracji PIT-2?
      </mat-checkbox>
    </span>
    <button type="submit" matButton="filled">Oblicz!</button>
    @if (calculated()) {
      <h3>Obecnie znajdujesz się w <u>{{ progPodatkowy() }}</u> progu podatkowym.</h3>
      <table class="results-table">
        <tbody>
          <tr>
            <th>Brutto rocznie</th>
            <td>{{ calucationForm.get('brutto')?.value }}</td>
          </tr>
          <tr>
            <th>Składki społeczne</th>
            <td>{{ skladkiSpoleczne() | number:'1.2-2' }}</td>
          </tr>
          <tr>
            <th>Składka zdrowotna</th>
            <td>{{ skladkaZdrowotna() | number:'1.2-2' }}</td>
          </tr>
          <tr>
            <th>Dochód - od tego zależy twój próg podatkowy</th>
            <td>{{ dochod() | number:'1.2-2' }}</td>
          </tr>
          <tr>
            <th>Podatek</th>
            <td>{{ podatek() | number:'1.2-2' }}</td>
          </tr>
          <tr>
            <th>Netto rocznie</th>
            <td>{{ nettoRocznie() | number:'1.2-2' }}</td>
          </tr>
          <tr>
            <th>Netto miesięcznie</th>
            <td>{{ nettoMiesiecznie() | number:'1.2-2' }}</td>
          </tr>
          @if (zaliczkaRozliczeniePIT() !== 0) {
            <tr>
              <th>Dodatkowa zaliczka do odbioru na rozliczenie PIT</th>
              <td>{{ zaliczkaRozliczeniePIT() | number:'1.2-2' }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  </form>
  `,
  styleUrl: './app.scss'
})
export class App {
  private fb = inject(FormBuilder)
  private taxCalculatorService = inject(TaxCalculatorService)
  protected readonly title = signal('Kalkulator podatkowy UOP');

  skladkiSpoleczne = signal<number | null>(null);
  skladkaZdrowotna = signal<number | null>(null);
  dochod = signal<number | null>(null);
  podatek = signal<number | null>(null);
  nettoRocznie = signal<number | null>(null);
  nettoMiesiecznie = signal<number | null>(null);
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

    this.skladkiSpoleczne.set(skladkiSpoleczne);
    this.skladkaZdrowotna.set(skladkaZdrowotna);
    this.dochod.set(dochod);
    this.podatek.set(podatek);
    this.nettoRocznie.set(nettoRocznie);
    if (pit2) {
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
