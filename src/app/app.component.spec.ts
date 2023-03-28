import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        HttpClientTestingModule, 
        FormsModule,
        RouterTestingModule.withRoutes([])
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve weather data when city is submitted', () => {
    component.cityName = 'London';
    component.onSubmit();
    const req = httpMock.expectOne(`https://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=${component.apiKey}`);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        name: 'London',
        country: 'United Kingdom',
        countryCode: 'GB',
        lon: -0.1257,
        lat: 51.5085,
      },
    ]);
    const req2 = httpMock.expectOne(`https://api.openweathermap.org/data/2.5/weather?q=London,GB&units=metric&appid=${component.apiKey}`);
    expect(req2.request.method).toBe('GET');
    req2.flush({
      name: 'London',
      main: {
        temp: 10,
        feels_like: 10,
        temp_min: 10,
        temp_max: 10,
        pressure: 1010,
        humidity: 80,
      },
      visibility: 10000,
      wind: {
        speed: 5,
        deg: 180,
      },
      weather: [
        {
          icon: '01d',
          description: 'clear sky',
        },
      ],
    });
    expect(component.weatherData?.name).toBe('London');
    expect(component.weatherData?.temperature).toBe(10);
  });

  it('should retrieve city list when city is typed in', () => {
    component.cityName = 'London';
    component.onSubmit();
    const req = httpMock.expectOne(`https://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=${component.apiKey}`);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        name: 'London',
        country: 'United Kingdom',
        countryCode: 'GB',
        lon: -0.1257,
        lat: 51.5085,
      },
      {
        name: 'London',
        country: 'Canada',
        countryCode: 'CA',
        lon: -81.233,
        lat: 42.9834,
      },
    ]);
    expect(component.cities.length).toBe(2);
    expect(component.cities[0].name).toBe('London, United Kingdom');
    expect(component.cities[0].country).toBe('United Kingdom');
    expect(component.cities[1].name).toBe('London, Canada');
    expect(component.cities[1].country).toBe('Canada');
  });

  it('should store city name and country code in local storage', () => {
    spyOn(localStorage, 'setItem');
    component.cityName = 'London';
    component.countryCode = 'GB';
    component.onCountrySelect();
    expect(localStorage.setItem).toHaveBeenCalledWith('city', 'London');
    expect(localStorage.setItem).toHaveBeenCalledWith('countryCode', 'GB');
  });
});