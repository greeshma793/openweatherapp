import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
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

  it('should get city data on form submit', () => {
    component.cityName = 'Turku';
    component.onSubmit();

    const req = httpMock.expectOne(`https://api.openweathermap.org/geo/1.0/direct?q=${component.cityName}&limit=5&appid=${component.apiKey}`);
    expect(req.request.method).toBe('GET');
    req.flush([{name: 'Turku', country: 'Finland', countryCode: 'FI'}]);

    expect(component.cities.length).toBe(1);
    expect(component.cities[0].name).toBe('Turku, Finland');
  });

  it('should get weather coordinates on country select', () => {
    component.cityName = 'Turku';
    component.countryCode = 'FI';
    component.onCountrySelect();

    const req = httpMock.expectOne(`https://api.openweathermap.org/data/2.5/weather?q=${component.cityName},${component.countryCode}&units=metric&appid=${component.apiKey}`);
    expect(req.request.method).toBe('GET');
    req.flush({
      name: 'Turku',
      coord: {
        lon: 26,
        lat: 64,
        }
    });

    expect(component.weatherData.lon).toBe(26);
    expect(component.weatherData.lat).toBe(64);

  });
});
