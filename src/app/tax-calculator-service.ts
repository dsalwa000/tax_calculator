import { Injectable } from '@angular/core';

export enum ProgPodatkowy {
  PIERWSZY = 'pierwszym',
  DRUGI = 'drugim',
  TRZECI = 'trzecim'
}

export interface SalaryResult {
  progPodatkowy: ProgPodatkowy;
  skladkiSpoleczne: number;
  skladkaZdrowotna: number;
  dochod: number;
  podatek: number;
  nettoRocznie: number;
  nettoMiesiecznie: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaxCalculatorService {
  readonly EMERYTALNA = 0.0976;
  readonly RENTOWA = 0.015;
  readonly CHOROBOWA = 0.0245;
  readonly SKLADKI_SPOLECZNE = this.EMERYTALNA + this.RENTOWA + this.CHOROBOWA;

  readonly KWOTA_SPOLECZNA_BOGACI = 234720.0;
  readonly SKLADKI_SPOLECZNE_BOGACI = this.CHOROBOWA;

  readonly PROCENT_ZDROWOTNA = 0.09;
  readonly KOSZTY_UZYSKANIA_PRZYCHODU = 3000.0;

  readonly DRUGI_PROG = 120000.0;
  readonly TRZECI_PROG = 1000000.0;
  readonly KWOTA_ZMNIEJSZAJACA_PODATEK = 3600.0;

  readonly PROCENT_PIERWSZY_PROG = 0.12;
  readonly PROCENT_DRUGI_PROG = 0.32;
  readonly DANINA_SOLIDARNOSCIOWA = 0.04;
  readonly PROCENT_TRZECI_PROG = this.PROCENT_DRUGI_PROG + this.DANINA_SOLIDARNOSCIOWA;

  constructor() {}

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  calculate(bruttoRocznie: number): SalaryResult {
    let kwotaSpoleczna = 0;
    
    if (bruttoRocznie >= this.KWOTA_SPOLECZNA_BOGACI) {
      const pelneSkladki = this.KWOTA_SPOLECZNA_BOGACI * this.SKLADKI_SPOLECZNE;
      const chorobowaOdNadwyzki = (bruttoRocznie - this.KWOTA_SPOLECZNA_BOGACI) * this.SKLADKI_SPOLECZNE_BOGACI;
      kwotaSpoleczna = pelneSkladki + chorobowaOdNadwyzki;
    } else {
      kwotaSpoleczna = bruttoRocznie * this.SKLADKI_SPOLECZNE;
    }
    kwotaSpoleczna = this.round(kwotaSpoleczna);

    const dochod = bruttoRocznie - kwotaSpoleczna - this.KOSZTY_UZYSKANIA_PRZYCHODU;
    const skladkaZdrowotna = this.round((bruttoRocznie - kwotaSpoleczna) * this.PROCENT_ZDROWOTNA);

    let podatek = 0;

    let progPodatowy: ProgPodatkowy = ProgPodatkowy.PIERWSZY;

    if (dochod > this.TRZECI_PROG) {
      progPodatowy = ProgPodatkowy.TRZECI

      const podatekPierwszyProg = this.DRUGI_PROG * this.PROCENT_PIERWSZY_PROG;
      const podatekDrugiProg = (this.TRZECI_PROG - this.DRUGI_PROG) * this.PROCENT_DRUGI_PROG;
      const podatekTrzeciProg = (dochod - this.TRZECI_PROG) * this.PROCENT_TRZECI_PROG;
      
      podatek = podatekPierwszyProg + podatekDrugiProg + podatekTrzeciProg - this.KWOTA_ZMNIEJSZAJACA_PODATEK;
      
    } else if (dochod > this.DRUGI_PROG) {
      progPodatowy = ProgPodatkowy.DRUGI

      const podatekPierwszyProg = this.DRUGI_PROG * this.PROCENT_PIERWSZY_PROG;
      const podatekDrugiProg = (dochod - this.DRUGI_PROG) * this.PROCENT_DRUGI_PROG;
      
      podatek = podatekPierwszyProg + podatekDrugiProg - this.KWOTA_ZMNIEJSZAJACA_PODATEK;
      
    } else {
      podatek = (dochod * this.PROCENT_PIERWSZY_PROG) - this.KWOTA_ZMNIEJSZAJACA_PODATEK;
    }

    podatek = this.round(podatek);
    if (podatek < 0) {
      podatek = 0;
    }

    const nettoRocznie = this.round(bruttoRocznie - kwotaSpoleczna - podatek - skladkaZdrowotna);

    return {
      progPodatkowy: progPodatowy,
      skladkiSpoleczne: kwotaSpoleczna,
      skladkaZdrowotna: skladkaZdrowotna,
      dochod: this.round(dochod),
      podatek: podatek,
      nettoRocznie: nettoRocznie,
      nettoMiesiecznie: this.round(nettoRocznie / 12)
    };
  }
}
