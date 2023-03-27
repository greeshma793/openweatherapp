import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface City {
  name: string;
  country: string;
  countryCode: string;
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'weather-app';
  cityName = '';
  countryCode = '';
  cities: City[] = [];
  weatherData: any;
  apiKey = '26aebd88d7be24240cd023de03361295';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  
  ngOnInit() {
    // retrieve city name and country code from localStorage if present
    const cityName = localStorage.getItem('cityName');
    const countryCode = localStorage.getItem('countryCode');
    if (cityName && countryCode) {
      this.cityName = cityName;
      this.countryCode = countryCode;
      this.getWeatherData();
    }
  }

  onSubmit() {
    this.weatherData = undefined; // clear previous data
    this.http
      .get<City[]>(`https://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&limit=5&appid=${this.apiKey}`)
      .subscribe(data => {
        // Discard the repeated entries with the same country name
        const countries = new Set<string>();
        const uniqueCities = data.filter(city => {
          if (countries.has(city.country)) {
            return false;
          } else {}
            countries.add(city.country);
            return true;
          }
        });
        this.cities = uniqueCities.map(city => {
          if (uniqueCities.filter(c => c.name === city.name).length > 1) {
            return {
              name: `${city.name}, ${city.country}`,
              country: city.country,
              countryCode: city.countryCode,
              lon: city.lon,
              lat: city.lat
            };
          } else {
            return {
              name: `${city.name}, ${city.countryCode}`,
              country: city.country,
              countryCode: city.countryCode,
              lon: city.lon,
              lat: city.lat
            };
          }
        });

        if (this.cities.length === 1) {
          this.countryCode = this.cities[0].country;
          this.getWeatherData();
        }
      });

    // store city name and country code in localStorage
    localStorage.setItem('cityName', this.cityName);
    localStorage.setItem('countryCode', this.countryCode);
  }

  onCountrySelect() {
    this.getWeatherData();

    // update city name and country code in localStorage
    localStorage.setItem('cityName', this.cityName);
    localStorage.setItem('countryCode', this.countryCode);
  }
  
  private getWeatherData() {
    this.http
      .get<any>(`https://api.openweathermap.org/data/2.5/weather?q=${this.cityName},${this.countryCode}&units=metric&appid=${this.apiKey}`)
      .subscribe(data => {
        this.weatherData = {
          name: data.name,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          temperatureMin: data.main.temp_min,
          temperatureMax: data.main.temp_max,
          pressure: data.main.pressure,
          humidity: data.main.humidity,
          visibility: data.visibility,
          windSpeed: data.wind.speed,
          windDeg: data.wind.deg,
          icon: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
          description: data.weather[0].description
        };
      });
  } 
}