# Aplikacja mobilna Ecofy

**Ecofy** to aplikacja mobilna zaprojektowana, aby pomóc użytkownikom odkrywać i tworzyć lokalne inicjatywy ekologiczne. Od sprzątania parków i sadzenia drzew po warsztaty edukacyjne, Ecofy umożliwia każdemu dołączenie do działań na rzecz zrównoważonego budowania społeczności.

## Funkcje

- **Mapa inicjatyw ekologicznych**: Odkrywaj lokalne wydarzenia ekologiczne, takie jak sprzątanie parków, sadzenie drzew, warsztaty i inne.
- **Twórz inicjatywy**: Użytkownicy mogą organizować własne wydarzenia, aby promować działania ekologiczne w swoich społecznościach.
- **Powiadomienia**: Bądź na bieżąco z nowymi inicjatywami dzięki powiadomieniom w czasie rzeczywistym.
- **Profil użytkownika**: Personalizuj swój profil i śledź swoje wkłady ekologiczne.
- **Społeczność ekologiczna**: Angażuj się w dyskusje i posty w sekcji społecznościowej z osobami o podobnych zainteresowaniach.

## Struktura aplikacji

- `app/` - Główne ekrany i układy aplikacji:
  - `(auth)` - Ekrany logowania i rejestracji użytkownika
  - `(tabs)` - Główne ekrany aplikacji (Mapa, Profil), widoczne po zalogowaniu
- `components/` - Reużywalne komponenty UI
- `assets/` - Pliki multimedialne i graficzne

## Technologie

- **React Native** + **Expo**: Główne frameworki do rozwoju aplikacji mobilnych
- **Firebase**: Backend do przechowywania danych, powiadomień, autentykacji i postów społecznościowych
- **React Navigation**: Do nawigacji między ekranami
- **Styled Components**: Używane do stylizacji aplikacji
- **Map API**: Do wyświetlania inicjatyw ekologicznych na mapie

Jasne, oto jak możesz zaktualizować instrukcje, aby użytkownicy wiedzieli, gdzie znaleźć klucze API:

## Instalacja

Aby zainstalować i uruchomić aplikację Ecofy lokalnie, wykonaj następujące kroki:

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/xfendi/ecofy-mobile.git
   ```

2. Przejdź do folderu projektu:
   ```bash
   cd ecofy-mobile
   ```

3. Zainstaluj zależności:
   ```bash
   npm install
   ```

4. Utwórz plik `.env` w głównym katalogu projektu i dodaj do niego poniższe zmienne środowiskowe. 

   Znajdziesz je w odpowiednich usługach:

   - **Firebase API Key**: W konsoli Firebase w sekcji "Ustawienia projektu" -> "Ogólne" -> "Twoje aplikacje".
   - **Geoapify API Key**: Na stronie [Geoapify](https://www.geoapify.com/) po rejestracji i stworzeniu projektu.
   - **Google Cloud Platform (GCP) API Key**: W konsoli Google Cloud Platform (GCP) po utworzeniu projektu i włączeniu odpowiednich usług API.

   Dodaj do pliku `.env`:

   ```
   EXPO_PUBLIC_FIREBASE_APIKEY
   EXPO_PUBLIC_FIREBASE_APPID
   EXPO_PUBLIC_GEOAPIFY_API_KEY
   EXPO_PUBLIC_GCP_API_KEY
   ```

5. Uruchom aplikację:
   ```bash
   npm start
   ```

6. Skanuj kod QR za pomocą aplikacji Expo Go, aby otworzyć aplikację na swoim urządzeniu.

## Pobierz

Możesz pobrać aplikację bezpośrednio z **Google Play Store**: [Pobierz Ecofy na Google Play]()

## Strona internetowa

Sprawdź oficjalną stronę internetową, aby uzyskać więcej informacji i aktualności: [Strona Ecofy]()

## Licencja

Ecofy jest oprogramowaniem **open-source** licencjonowanym na podstawie **GNU General Public License v3.0 (GPL-3.0)**. Oznacza to, że możesz swobodnie używać, modyfikować i dystrybuować aplikację, pod warunkiem że wszelkie modyfikacje lub dzieła pochodne będą również licencjonowane na tej samej licencji **GPL-3.0**.

Aby zapoznać się ze szczegółami, możesz przeczytać pełny tekst licencji w pliku [LICENSE](LICENSE).
