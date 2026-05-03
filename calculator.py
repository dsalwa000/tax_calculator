"""
Kalkulator 2 progu podatkowego dla UOP dla przynajmniej mininalnej krajowej

"""

"""Składka społeczna"""
emerytalna: float = 0.0976
rentowa: float = 0.015
chorobowa = 0.0245

skladki_spoleczne: float = (
    emerytalna + rentowa + chorobowa
)

"""
Ludzie zarabiający >= 234 720 złotych płacą tylko
składkę chorobową

"""
skladki_spoleczne_bogaci = chorobowa
kwota_spoleczna_bogaci: float = 234720.0

"""
Podstawą dla obliczania składki zdrotownej jest:
brutto - składki społeczne

"""
procent_zdrowotna: float = 0.09

"""Minimalna krajowa"""
min_brutto_miesiecznie = 4806
min_brutto_rocznie = min_brutto_miesiecznie * 12

"""Stawki podatku"""
drugi_prog: float = 120000.0
trzeci_prog: float = 1000000.0
kwota_zmniejszajaca_podatek: float = 3600.0

procent_pierwszy_prog = 0.12
procent_drugi_prog = 0.32
danina_solidarnosciowa = 0.04
procent_trzeci_prog = procent_drugi_prog + danina_solidarnosciowa

"""Nasze imputy"""
brutto: float = 0

while brutto < min_brutto_rocznie:
    brutto = float(input("Twoja kwota brutto rocznie: "))

koszty_uzyskania_przychodu: float = 3000.0

kwota_spoleczna: float = 0
if kwota_spoleczna_bogaci <= brutto:
    kwota_spoleczna = round(brutto * skladki_spoleczne_bogaci, 2)
else:
    kwota_spoleczna = round(brutto * skladki_spoleczne, 2)

dochod: float = brutto - kwota_spoleczna - koszty_uzyskania_przychodu
skladka_zdrowotna: float = (
    round((brutto - kwota_spoleczna) * procent_zdrowotna, 2)
)

podatek: float = 0
if dochod > drugi_prog:
    print("Jesteś juz na 2 progu podatkowym!\n")
    podatek_piewszy_prog = round(drugi_prog * procent_pierwszy_prog, 2)
    podatek_drugi_prog = round((dochod - drugi_prog) * procent_drugi_prog, 2)

    podatek = (
        podatek_piewszy_prog + podatek_drugi_prog - kwota_zmniejszajaca_podatek
    )

elif dochod > trzeci_prog:
    print("Płacisz daninę solidarnościową!\n")
    podatek_piewszy_prog = round(drugi_prog * procent_pierwszy_prog, 2)
    podatek_drugi_prog = round(trzeci_prog * procent_drugi_prog, 2)
    podatek_trzeci_prog = (
        round((dochod - trzeci_prog) * procent_trzeci_prog, 2)
    )

    podatek = (
        podatek_piewszy_prog
        + podatek_drugi_prog
        + podatek_trzeci_prog
        - kwota_zmniejszajaca_podatek
    )

else:
    print("Jeszcze nie jesteś na 2 progu podatkowym!\n")
    podatek = (
        round(procent_pierwszy_prog * dochod - kwota_zmniejszajaca_podatek, 2)
    )

netto: float = (
    round(brutto - kwota_spoleczna - podatek - skladka_zdrowotna, 2)
)

print(f"Skladki społeczne: {kwota_spoleczna} złotych")
print(f"Skladki zdrowotne: {skladka_zdrowotna} złotych")
print(f"Dochód rocznie: {dochod} złotych\n")

print(f"Końcowy podatek od dochodu: {podatek} złotych")
print(f"Realne zarobki rocznie: {netto} złotych")
print(f"Realne zarobki miesięczne: {(netto / 12):.2f} złotych")
