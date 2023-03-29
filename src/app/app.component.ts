import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'weather-app';
  name?: string;
  countries?: any[];
  selectedCountry: any;
  weatherData: any;

  constructor(private http: HttpClient) {
    const selectedCity = localStorage.getItem('selectedCity');
    if (selectedCity) {
      this.name = selectedCity;
      this.onSubmit();
    }
  }
  

  onSubmit() {
    console.log('Submitting form...');
    this.countries = undefined; // clear countries array
    this.weatherData = undefined; // clear previous data
    if (!this.name) {
      this.weatherData = { error: 'Please enter a city name' };
      return;
    }
    // API call to fetch the locations for the entered name
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${this.name}&limit=5&appid=26aebd88d7be24240cd023de03361295`;
    console.log('API URL:', apiUrl);
    this.http.get(apiUrl).subscribe((data: any) => {
      console.log('Locations:', data);
      if (data.length === 0) {
        // Display error message
        this.weatherData = { error: "City not found!" };
      } else {
        // Filter the data to only keep the first occurrence of a location
        const filteredData = data.filter((item: any, index: number, arr: any[]) => {
          return arr.findIndex((t: any) => t.name === item.name && t.country === item.country) === index;
        });
        if (filteredData.length > 1) {
          // Display dropdown with the multiple locations
          this.countries = filteredData;
        } else {
          // Only one location found, proceed to fetch weather data
          this.selectedCountry = filteredData[0];
          console.log('Selected Country:', this.selectedCountry);
          localStorage.setItem('selectedCity', this.selectedCountry.name);
          this.fetchWeatherData();
        }
      }
    });
  }
  
  
  
  
  onSelectCountry(event: any) {
    const selectedValue = event.target.value;
    if (event && event.target) {
    if (this.countries) {
      this.selectedCountry = this.countries.find(country => `${country.name}, ${country.country}` === selectedValue);
      console.log('Selected Country:', this.selectedCountry);
      this.fetchWeatherData();
    }
  }
  }

  fetchWeatherData() {
    console.log('Fetching weather data...');
    if (this.selectedCountry) {
      // API call to fetch the weather data for the selected location
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${this.selectedCountry.lat}&lon=${this.selectedCountry.lon}&units=metric&appid=26aebd88d7be24240cd023de03361295`;
      console.log('API URL:', apiUrl);
      this.http.get(apiUrl).subscribe((data: any) => {
        console.log('Weather data:', data);
        this.weatherData = data;
        // Construct the URL for the weather icon
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        // Add the icon URL to the weatherData object
        this.weatherData.iconUrl = iconUrl;
      });
    }
  }
  
}
